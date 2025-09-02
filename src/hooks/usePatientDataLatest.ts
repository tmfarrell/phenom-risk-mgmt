import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types/population';

// Mock providers for testing
const PROVIDERS = [
  { name: 'Provider A', npi: '1123456789' },
  { name: 'Provider B', npi: '1567890123' },
  { name: 'Provider C', npi: '1987654321' }
];

const getRandomProvider = (patientId: number) => {
  // Use patient ID as seed for consistent provider assignment
  const provider = PROVIDERS[patientId % PROVIDERS.length];
  return {
    name: provider.name,
    npi: provider.npi
  };
};

export const usePatientDataLatest = () => {
  return useQuery({
    queryKey: ['patient-data-latest'],
    queryFn: async () => {
      console.log('Fetching latest patient data...');
      
      // Fetch patients
      const { data: patients, error: patientsError } = await supabase
        .from('patient')
        .select('*');

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      // Fetch latest risk data for each patient, risk_type, and timeframe combination
      const { data: risks, error: risksError } = await supabase
        .from('phenom_risk')
        .select('*')
        .order('calculated_date', { ascending: false });

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Raw data:', { patients, risks });

      // Get unique combinations and their latest records
      const latestRisks = risks?.reduce((acc, risk) => {
        const key = `${risk.patient_id}-${risk.risk_type}-${risk.time_period}`;
        if (!acc[key] || new Date(risk.calculated_date || '') > new Date(acc[key].calculated_date || '')) {
          acc[key] = risk;
        }
        return acc;
      }, {} as Record<string, any>);

      // Transform data to match Person interface
      const transformedData: Person[] = (patients || []).flatMap((patient) => {
        const patientLatestRisks = Object.values(latestRisks || {})
          .filter((risk: any) => risk.patient_id === patient.patient_id);

        // Assign random provider based on patient ID
        const assignedProvider = getRandomProvider(patient.patient_id);

        // If no risks found for patient, return single entry with null values
        if (patientLatestRisks.length === 0) {
          return [{
            ...patient,
            provider: assignedProvider.name,
            provider_npi: assignedProvider.npi,
            history: null,
            composite_risk: null,
            ED: null,
            Hospitalization: null,
            Fall: null,
            Stroke: null,
            MI: null,
            HS: null,
            Mortality: null,
            ED_change: null,
            Hospitalization_change: null,
            Fall_change: null,
            Stroke_change: null,
            MI_change: null,
            HS_change: null,
            Mortality_change: null,
            recorded_date: null,
            prediction_timeframe_yrs: null,
            risk_type: null,
            change_since: null
          }];
        }

        // Return an entry for each unique risk type and timeframe combination
        return patientLatestRisks.map((risk: any) => {
          
          return {
            ...patient,
            provider: assignedProvider.name,
            provider_npi: assignedProvider.npi,
            history: null,
            composite_risk: risk.composite_risk || null,
            ED: risk.EMERGENCY_VISIT || null,
            Hospitalization: risk.HOSPITALIZATION || null,
            Fall: risk.FALL || null,
            Stroke: risk.STROKE || null,
            MI: risk.INFARCTION || null,
            HS: risk.INFARCTION || null, // Reuse MI values for HS
            Mortality: risk.DEATH !== undefined ? risk.DEATH : null, // Explicitly map DEATH to Mortality
            ED_change: risk.EMERGENCY_VISIT_change || null,
            Hospitalization_change: risk.HOSPITALIZATION_change || null,
            Fall_change: risk.FALL_change || null,
            Stroke_change: risk.STROKE_change || null,
            MI_change: risk.INFARCTION_change || null,
            HS_change: risk.INFARCTION_change || null, // Reuse MI change values for HS
            Mortality_change: risk.DEATH_change !== undefined ? risk.DEATH_change : null, // Explicitly map DEATH_change to Mortality_change
            recorded_date: risk.calculated_date,
            prediction_timeframe_yrs: risk.time_period,
            risk_type: (risk.risk_type as 'relative' | 'absolute' | null) || null,
            change_since: risk.change_since || null
          };
        });
      });

      console.log('Transformed latest data:', transformedData);
      return transformedData;
    }
  });
};
