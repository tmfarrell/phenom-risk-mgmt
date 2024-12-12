import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types/population';

export const usePatientData = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      console.log('Fetching patient data...');
      
      // Fetch patients
      const { data: patients, error: patientsError } = await supabase
        .from('patient')
        .select('*');

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      // Fetch risk data and order by recorded_date to get latest entries
      const { data: risks, error: risksError } = await supabase
        .from('phenom_risk')
        .select('*')
        .order('recorded_date', { ascending: false });

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Raw data:', { patients, risks });

      // Create a map to store the latest risk entry for each unique combination
      const latestRisks = new Map();
      
      risks.forEach(risk => {
        // Create a unique key for each combination
        const key = `${risk.patient_id}-${risk.prediction_timeframe_yrs}-${risk.risk_type}`;
        
        // Only store the first occurrence (which is the latest due to our ordering)
        if (!latestRisks.has(key)) {
          latestRisks.set(key, risk);
        }
      });

      // Transform data to match Person interface using only the latest risks
      const transformedData: Person[] = patients.flatMap((patient) => {
        const patientRisks = Array.from(latestRisks.values())
          .filter(risk => risk.patient_id === patient.patient_id);
        
        // If no risks found for patient, return single entry with null values
        if (patientRisks.length === 0) {
          return [{
            ...patient,
            ED: null,
            Hospitalization: null,
            Fall: null,
            Stroke: null,
            MI: null,
            CKD: null,
            'Mental Health': null,
            recorded_date: null,
            prediction_timeframe_yrs: null,
            risk_type: null
          }];
        }
        
        // Return an entry for each risk timeframe and type combination
        return patientRisks.map(risk => ({
          ...patient,
          ED: risk.ED,
          Hospitalization: risk.Hospitalization,
          Fall: risk.Fall,
          Stroke: risk.Stroke,
          MI: risk.MI,
          CKD: risk.CKD,
          'Mental Health': risk['Mental Health'],
          recorded_date: risk.recorded_date,
          prediction_timeframe_yrs: risk.prediction_timeframe_yrs,
          risk_type: risk.risk_type
        }));
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};