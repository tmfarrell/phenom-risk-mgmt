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
        .from('phenom_risk_abs')
        .select('*');

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Raw data:', { patients, risks });

      // Transform data to match Person interface
      const transformedData: Person[] = patients.map((patient) => {
        const patientRisks = risks.find(risk => risk.patient_id === patient.patient_id) || {};
        
        // Combine patient data with risk data
        return {
          ...patient,
          ED: patientRisks.ED || null,
          Hospitalization: patientRisks.Hospitalization || null,
          Fall: patientRisks.Fall || null,
          Stroke: patientRisks.Stroke || null,
          MI: patientRisks.MI || null,
          CKD: patientRisks.CKD || null,
          'Mental Health': patientRisks['Mental Health'] || null
        };
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};