import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProviderFilterValues } from '@/pages/Regional';

export interface ProviderRecord {
  id: string;
  npi: string;
  name: string;
  practice: string;
  specialty: string;
  state: string;
  city: string;
  zip_code: string;
  years_in_practice: number;
  prescribing_volume_tier: string;
  is_client_target: boolean;
  phenom_lift_potential: number;
  patients_phenom?: number;
  latitude: number;
  longitude: number;
  patients: number;
  status: string;
  location: string;
  prescribing_decile?: number | null;
  avg_rx_pt_yr?: number | null;
}

export interface ProvidersQueryParams {
  modelId?: string | null;
  filters?: ProviderFilterValues;
  npiListName?: string | null;
  sortField?: 'patients_phenom' | 'phenom_lift_potential' | 'name' | 'npi' | 'location' | 'specialty';
  sortDirection?: 'asc' | 'desc';
  page?: number; // 1-based
  pageSize?: number;
}

const normalizeNpi = (npi: any): string => {
  if (npi === null || npi === undefined) return '';
  const digits = String(npi).trim().replace(/\D/g, '');
  return digits.replace(/^0+/, '');
};

export const useProvidersData = ({ modelId, filters, npiListName, sortField = 'patients_phenom', sortDirection = 'desc', page = 1, pageSize = 250 }: ProvidersQueryParams) => {
  return useQuery<{ providers: ProviderRecord[]; total: number; page: number; pageSize: number; totalPages: number }>({
    queryKey: ['providers-data', modelId, filters, npiListName, sortField, sortDirection, page, pageSize],
    enabled: Boolean(modelId),
    staleTime: 60_000,
    queryFn: async () => {
      if (!modelId) {
        return { providers: [], total: 0, page, pageSize, totalPages: 0 };
      }

      // Build NPI set early so we can apply server-side filtering when requested
      let userNpiSet = new Set<string>();
      let userNpiArray: string[] = [];
      const shouldFilterByTargetStatus = Boolean(npiListName && filters?.isClientTarget && filters.isClientTarget !== 'all');
      if (npiListName) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: npiListData, error: npiListError } = await supabase
              .from('npi_lists')
              .select('npi')
              .eq('user_id', user.id)
              .eq('name', npiListName);
            if (!npiListError && npiListData) {
              // Use digits-only for DB comparisons; avoid stripping leading zeros
              const toDigitsOnly = (npi: any) => {
                if (npi === null || npi === undefined) return '';
                return String(npi).trim().replace(/\D/g, '');
              };
              userNpiArray = npiListData.map((item: any) => toDigitsOnly(item.npi)).filter(Boolean);
              userNpiSet = new Set(userNpiArray.map((n) => normalizeNpi(n)));
            }
          }
        } catch (err) {
          console.error('Error loading NPI list for filtering:', err);
        }
      }

      const sb: any = supabase as any;
      
      // Check if medication filtering is needed
      const needsMedicationFiltering = (filters?.medications && filters.medications.length > 0) ||
                                      (filters?.notPrescribedMedications && filters.notPrescribedMedications.length > 0);
      
      // If medication filtering is needed, use RPC approach
      if (needsMedicationFiltering) {
        const mappedStatuses = (filters?.statusValues || []).map((s) =>
          s === 'High Potential' ? 'HIGH' : s === 'Medium Potential' ? 'MEDIUM' : s === 'Low Potential' ? 'LOW' : s
        );
        const { data: rpcRows, error: rpcError } = await sb.rpc('get_providers_with_medication_filters', {
          p_model_id: modelId,
          p_list_name: npiListName,
          p_target_filter: filters?.isClientTarget || 'all',
          p_search_query: filters?.searchQuery || null,
          p_states: (filters?.states && filters.states.length > 0) ? filters.states : null,
          p_specialties: (filters?.specialties && filters.specialties.length > 0) ? filters.specialties : null,
          p_min_years: filters?.minYearsInPractice || 0,
          p_status_values: (mappedStatuses.length > 0) ? mappedStatuses : null,
          p_prescribed_medications: (filters?.medications && filters.medications.length > 0) ? filters.medications : null,
          p_not_prescribed_medications: (filters?.notPrescribedMedications && filters.notPrescribedMedications.length > 0) ? filters.notPrescribedMedications : null,
          p_sort_field: sortField === 'phenom_lift_potential' ? 'phenom_lift' : sortField,
          p_sort_direction: sortDirection,
          p_page: page,
          p_page_size: pageSize,
        });
        if (rpcError) {
          console.error('Error fetching providers with medication filters via RPC:', rpcError);
          return { providers: [], total: 0, page, pageSize, totalPages: 0 };
        }
        const rows = (rpcRows as any[]) || [];
        const transformedFromRpc = rows.map((row: any) => {
          const rawStatus = row.status || 'Unknown';
          const niceStatus = typeof rawStatus === 'string' ? (
            rawStatus.toUpperCase() === 'HIGH' ? 'High Potential' :
            rawStatus.toUpperCase() === 'MEDIUM' ? 'Medium Potential' :
            rawStatus.toUpperCase() === 'LOW' ? 'Low Potential' : rawStatus
          ) : 'Unknown';
          const zipRaw = row.zip5;
          const zipStr = zipRaw ? Math.round(parseFloat(zipRaw)).toString() : 'Unknown';
          const lat = row.latitude !== null && row.latitude !== undefined ? parseFloat(row.latitude) : 0;
          const lng = row.longitude !== null && row.longitude !== undefined ? parseFloat(row.longitude) : 0;
          const record: ProviderRecord = {
            id: row.id?.toString?.() || row.npi,
            npi: row.npi,
            name: row.name || 'Unknown',
            practice: row.practice || 'Unknown',
            specialty: row.specialty || 'Unknown',
            state: row.state || 'Unknown',
            city: row.city || 'Unknown',
            zip_code: zipStr,
            years_in_practice: row.years_in_practice || 0,
            prescribing_volume_tier: 'Unknown',
            is_client_target: Boolean(row.is_client_target),
            phenom_lift_potential: Number(row.phenom_lift) || 0,
            patients_phenom: (row.patients_phenom !== undefined && row.patients_phenom !== null) ? Number(row.patients_phenom) : undefined,
            latitude: isNaN(lat) ? 0 : lat,
            longitude: isNaN(lng) ? 0 : lng,
            patients: row.patients_total || 0,
            status: niceStatus,
            location: `${row.city || 'Unknown'}, ${row.state || 'Unknown'} ${zipStr}`,
            prescribing_decile: null,
            avg_rx_pt_yr: null,
          };
          return record;
        });
        const totalFromRpc = rows.length > 0 && rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        const totalPagesFromRpc = pageSize > 0 ? Math.max(1, Math.ceil(totalFromRpc / pageSize)) : 1;
        return { providers: transformedFromRpc, total: totalFromRpc, page, pageSize, totalPages: totalPagesFromRpc };
      }
      
      // If target status filtering is active, use RPC that joins to the user's NPI list
      if (shouldFilterByTargetStatus) {
        const mappedStatuses = (filters?.statusValues || []).map((s) =>
          s === 'High Potential' ? 'HIGH' : s === 'Medium Potential' ? 'MEDIUM' : s === 'Low Potential' ? 'LOW' : s
        );
        const { data: rpcRows, error: rpcError } = await sb.rpc('get_providers_by_target', {
          p_model_id: modelId,
          p_list_name: npiListName,
          p_target_filter: filters?.isClientTarget || 'all',
          p_search_query: filters?.searchQuery || null,
          p_states: (filters?.states && filters.states.length > 0) ? filters.states : null,
          p_specialties: (filters?.specialties && filters.specialties.length > 0) ? filters.specialties : null,
          p_min_years: filters?.minYearsInPractice || 0,
          p_status_values: (mappedStatuses.length > 0) ? mappedStatuses : null,
          p_sort_field: sortField === 'phenom_lift_potential' ? 'phenom_lift' : sortField,
          p_sort_direction: sortDirection,
          p_page: page,
          p_page_size: pageSize,
        });
        if (rpcError) {
          console.error('Error fetching providers via RPC:', rpcError);
          return { providers: [], total: 0, page, pageSize, totalPages: 0 };
        }
        const rows = (rpcRows as any[]) || [];
        const transformedFromRpc = rows.map((row: any) => {
          const rawStatus = row.status || 'Unknown';
          const niceStatus = typeof rawStatus === 'string' ? (
            rawStatus.toUpperCase() === 'HIGH' ? 'High Potential' :
            rawStatus.toUpperCase() === 'MEDIUM' ? 'Medium Potential' :
            rawStatus.toUpperCase() === 'LOW' ? 'Low Potential' : rawStatus
          ) : 'Unknown';
          const zipRaw = row.zip5;
          const zipStr = zipRaw ? Math.round(parseFloat(zipRaw)).toString() : 'Unknown';
          const lat = row.latitude !== null && row.latitude !== undefined ? parseFloat(row.latitude) : 0;
          const lng = row.longitude !== null && row.longitude !== undefined ? parseFloat(row.longitude) : 0;
          const record: ProviderRecord = {
            id: row.id?.toString?.() || row.npi,
            npi: row.npi,
            name: row.name || 'Unknown',
            practice: row.practice || 'Unknown',
            specialty: row.specialty || 'Unknown',
            state: row.state || 'Unknown',
            city: row.city || 'Unknown',
            zip_code: zipStr,
            years_in_practice: row.years_in_practice || 0,
            prescribing_volume_tier: 'Unknown',
            is_client_target: Boolean(row.is_client_target),
            phenom_lift_potential: Number(row.phenom_lift) || 0,
            patients_phenom: (row.patients_phenom !== undefined && row.patients_phenom !== null) ? Number(row.patients_phenom) : undefined,
            latitude: isNaN(lat) ? 0 : lat,
            longitude: isNaN(lng) ? 0 : lng,
            patients: row.patients_total || 0,
            status: niceStatus,
            location: `${row.city || 'Unknown'}, ${row.state || 'Unknown'} ${zipStr}`,
            prescribing_decile: null,
            avg_rx_pt_yr: null,
          };
          return record;
        });
        const totalFromRpc = rows.length > 0 && rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        const totalPagesFromRpc = pageSize > 0 ? Math.max(1, Math.ceil(totalFromRpc / pageSize)) : 1;
        return { providers: transformedFromRpc, total: totalFromRpc, page, pageSize, totalPages: totalPagesFromRpc };
      }
      // Fallback to default view path when not filtering by target status
      let query = sb
        .from('provider_analytics_with_geography')
        .select(`
          id,
          model_id,
          npi,
          patients_total,
          patients_phenom,
          phenom_lift,
          status,
          name,
          practice,
          specialty,
          state,
          city,
          zip5,
          years_in_practice,
          latitude,
          longitude
        `, { count: 'exact' })
        .eq('model_id', modelId);

      if (filters?.states && filters.states.length > 0) {
        query = query.in('state', filters.states);
      }
      if (filters?.specialties && filters.specialties.length > 0) {
        query = query.in('specialty', filters.specialties);
      }
      if (filters?.minYearsInPractice && filters.minYearsInPractice > 0) {
        query = query.gte('years_in_practice', filters.minYearsInPractice);
      }
      if (filters?.statusValues && filters.statusValues.length > 0) {
        const rawStatuses = filters.statusValues.map((s) =>
          s === 'High Potential' ? 'HIGH' : s === 'Medium Potential' ? 'MEDIUM' : s === 'Low Potential' ? 'LOW' : s
        );
        query = query.in('status', rawStatuses);
      }
      // Search by name or NPI
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.trim();
        const digits = q.replace(/\D/g, '');
        if (digits.length >= 3) {
          query = query.or(`npi.ilike.%${digits}%,name.ilike.%${q}%`);
        } else {
          query = query.ilike('name', `%${q}%`);
        }
      }

      // Apply server-side sorting
      const ascending = sortDirection === 'asc';
      if (sortField === 'patients_phenom') {
        query = query.order('patients_phenom', { ascending });
      } else if (sortField === 'phenom_lift_potential') {
        query = query.order('phenom_lift', { ascending });
      } else if (sortField === 'name') {
        query = query.order('name', { ascending });
      } else if (sortField === 'npi') {
        query = query.order('npi', { ascending });
      } else if (sortField === 'specialty') {
        query = query.order('specialty', { ascending });
      } else if (sortField === 'location') {
        // Approximate location sort by state, then city, then zip5
        query = query.order('state', { ascending }).order('city', { ascending }).order('zip5', { ascending });
      }
      // Stable secondary order by npi
      query = query.order('npi', { ascending: true });

      // Pagination
      const start = Math.max(0, (page - 1) * pageSize);
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data: viewData, error: viewError, count } = await query;
      if (viewError) {
        console.error('Error fetching provider analytics view:', viewError);
        return { providers: [], total: 0, page, pageSize, totalPages: 0 };
      }

      let transformed = (viewData || []).map((row: any) => {
        const rawStatus = row.status || 'Unknown';
        const niceStatus = typeof rawStatus === 'string' ? (
          rawStatus.toUpperCase() === 'HIGH' ? 'High Potential' :
          rawStatus.toUpperCase() === 'MEDIUM' ? 'Medium Potential' :
          rawStatus.toUpperCase() === 'LOW' ? 'Low Potential' : rawStatus
        ) : 'Unknown';

        const zipRaw = row.zip5;
        const zipStr = zipRaw ? Math.round(parseFloat(zipRaw)).toString() : 'Unknown';
        const lat = row.latitude !== null && row.latitude !== undefined ? parseFloat(row.latitude) : 0;
        const lng = row.longitude !== null && row.longitude !== undefined ? parseFloat(row.longitude) : 0;

        const record: ProviderRecord = {
          id: row.id?.toString?.() || row.npi,
          npi: row.npi,
          name: row.name || 'Unknown',
          practice: row.practice || 'Unknown',
          specialty: row.specialty || 'Unknown',  
          state: row.state || 'Unknown',
          city: row.city || 'Unknown',
          zip_code: zipStr,
          years_in_practice: row.years_in_practice || 0,
          prescribing_volume_tier: 'Unknown',
          is_client_target: userNpiSet.has(normalizeNpi(row.npi)),
          phenom_lift_potential: Number(row.phenom_lift) || 0,
          patients_phenom: (row.patients_phenom !== undefined && row.patients_phenom !== null) ? Number(row.patients_phenom) : undefined,
          latitude: isNaN(lat) ? 0 : lat,
          longitude: isNaN(lng) ? 0 : lng,
          patients: row.patients_total || 0,
          status: niceStatus,
          location: `${row.city || 'Unknown'}, ${row.state || 'Unknown'} ${zipStr}`,
          prescribing_decile: null,
          avg_rx_pt_yr: null,
        };
        return record;
      });

      const total = count || 0;
      const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
      return { providers: transformed, total, page, pageSize, totalPages };
    },
  });
};

export type UseProvidersDataResult = ReturnType<typeof useProvidersData>;


