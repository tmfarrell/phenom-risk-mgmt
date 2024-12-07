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

      // Fetch risk data
      const { data: risks, error: risksError } = await supabase
        .from('phenom_risk_rel')
        .select('*');

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Raw data:', { patients, risks });

      // Transform data to match Person interface
      const transformedData: Person[] = patients.flatMap((patient) => {
        const patientRisks = risks.filter(risk => risk.patient_id === patient.patient_id);
        
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
            prediction_timeframe_yrs: null
          }];
        }
        
        // Return an entry for each risk timeframe
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
          prediction_timeframe_yrs: risk.prediction_timeframe_yrs
        }));
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};