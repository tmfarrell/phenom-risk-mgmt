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
      
      // First, fetch available outcomes from phenom_models
      const { data: phenomModels, error: modelsError } = await supabase
        .from('phenom_models')
        .select('indication_code, prediction_timeframe_yrs');

      if (modelsError) {
        console.error('Error fetching phenom models:', modelsError);
        throw modelsError;
      }

      // Extract unique outcomes (include models with and without timeframe)
      const availableOutcomes = [...new Set(phenomModels?.map(item => item.indication_code) || [])];
      console.log('Available outcomes:', availableOutcomes);
      
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
          const basePatient: Person = {
            ...patient,
            provider: assignedProvider.name,
            provider_npi: assignedProvider.npi,
            history: null,
            composite_risk: null,
            recorded_date: null,
            prediction_timeframe_yrs: null,
            risk_type: null,
            change_since: null
          };
          
          // Add null values for each available outcome
          availableOutcomes.forEach(outcome => {
            basePatient[outcome] = null;
            basePatient[`${outcome}_change`] = null;
          });
          
          return [basePatient];
        }

        // Return an entry for each unique risk type and timeframe combination
        return patientLatestRisks.map((risk: any) => {
          const basePatient: Person = {
            ...patient,
            provider: assignedProvider.name,
            provider_npi: assignedProvider.npi,
            history: null,
            composite_risk: risk.composite_risk || null,
            recorded_date: risk.calculated_date,
            prediction_timeframe_yrs: risk.time_period,
            risk_type: (risk.risk_type as 'relative' | 'absolute' | null) || null,
            change_since: risk.change_since || null
          };
          
          // For demo purposes: pick random values from available risk fields for each outcome
          const riskFields = ['EMERGENCY_VISIT', 'HOSPITALIZATION', 'FALL', 'STROKE', 'INFARCTION', 'DEATH'];
          
          availableOutcomes.forEach(outcome => {
            // Pick a random risk field to use for this outcome
            const randomField = riskFields[Math.floor(Math.random() * riskFields.length)];
            const changeField = `${randomField}_change`;
            
            // Assign the random values
            basePatient[outcome] = risk[randomField] || null;
            basePatient[`${outcome}_change`] = risk[changeField] || null;
          });
          
          return basePatient;
        });
      });

      // Create synthetic 'today' entries using latest 1-year records as source (demo purpose)
      const todayRecords: Person[] = (patients || []).flatMap((patient) => {
        const assignedProvider = getRandomProvider(patient.patient_id);
        const riskTypes: Array<'relative' | 'absolute'> = ['relative', 'absolute'];
        return riskTypes.flatMap((rt) => {
          const key = `${patient.patient_id}-${rt}-1`;
          const sourceRisk: any = (latestRisks || {})[key];
          if (!sourceRisk) return [];

          const basePatient: Person = {
            ...patient,
            provider: assignedProvider.name,
            provider_npi: assignedProvider.npi,
            history: null,
            composite_risk: sourceRisk.composite_risk || null,
            recorded_date: sourceRisk.calculated_date,
            prediction_timeframe_yrs: null, // mark as 'today'
            risk_type: (rt as 'relative' | 'absolute'),
            change_since: sourceRisk.change_since || null
          };

          const riskFields = ['EMERGENCY_VISIT', 'HOSPITALIZATION', 'FALL', 'STROKE', 'INFARCTION', 'DEATH'];
          availableOutcomes.forEach(outcome => {
            const randomField = riskFields[Math.floor(Math.random() * riskFields.length)];
            const changeField = `${randomField}_change`;
            basePatient[outcome] = sourceRisk[randomField] || null;
            basePatient[`${outcome}_change`] = sourceRisk[changeField] || null;
          });

          return [basePatient];
        });
      });

      const finalData = [...transformedData, ...todayRecords];

      console.log('Transformed latest data (with today records):', finalData);
      return finalData;
    }
  });
};
