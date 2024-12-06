import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types/population';

interface RiskData {
  user_id: number;
  condition: string;
  risk: number;
}

interface PatientData {
  user_id: number;
  name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
}

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
        .from('phenom_risk')
        .select('*');

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Fetched data:', { patients, risks });

      // Transform data to match Person interface
      const transformedData: Person[] = patients.map((patient: PatientData) => {
        const userRisks = risks.filter((risk: RiskData) => risk.user_id === patient.user_id);
        
        const patientRisks: Person = {
          name: patient.name || 'Unknown',
          age: patient.age || 0,
          gender: (patient.gender as 'Male' | 'Female' | 'Other') || 'Other',
          location: patient.location || 'Unknown'
        };

        // Add risk conditions dynamically
        userRisks.forEach((risk) => {
          patientRisks[risk.condition] = risk.risk;
        });

        return patientRisks;
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};