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

      console.log('Fetched data:', { patients, risks });

      // Transform data to match Person interface
      const transformedData: Person[] = patients.map((patient) => {
        const patientRisks = risks.find(risk => risk.patient_id === patient.patient_id) || {};
        
        // Combine patient data with risk data
        const personData: Person = {
          patient_id: patient.patient_id,
          name: patient.name,
          mrn: patient.mrn,
          dob: patient.dob,
          last_visit: patient.last_visit,
          age: patient.age,
          gender: patient.gender,
          location: patient.location,
          // Add risk factors
          ED: patientRisks.ED,
          Hospitalization: patientRisks.Hospitalization,
          Fall: patientRisks.Fall,
          Stroke: patientRisks.Stroke,
          MI: patientRisks.MI,
          CKD: patientRisks.CKD,
          'Mental Health': patientRisks['Mental Health']
        };

        return personData;
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};