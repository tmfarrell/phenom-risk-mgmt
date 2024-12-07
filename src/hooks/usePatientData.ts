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

      // Fetch risk data - Updated table name from phenom_risk_abs to phenom_risk_rel
      const { data: risks, error: risksError } = await supabase
        .from('phenom_risk_rel')
        .select('*');

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Raw data:', { patients, risks });

      // Transform data to match Person interface
      const transformedData: Person[] = patients.map((patient) => {
        const patientRisks = risks.find(risk => risk.patient_id === patient.patient_id) || {
          ED: null,
          Hospitalization: null,
          Fall: null,
          Stroke: null,
          MI: null,
          CKD: null,
          'Mental Health': null,
          recorded_date: null,
          prediction_timeframe_yrs: null
        };
        
        // Combine patient data with risk data
        return {
          ...patient,
          ED: patientRisks.ED,
          Hospitalization: patientRisks.Hospitalization,
          Fall: patientRisks.Fall,
          Stroke: patientRisks.Stroke,
          MI: patientRisks.MI,
          CKD: patientRisks.CKD,
          'Mental Health': patientRisks['Mental Health'],
          recorded_date: patientRisks.recorded_date,
          prediction_timeframe_yrs: patientRisks.prediction_timeframe_yrs
        };
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};