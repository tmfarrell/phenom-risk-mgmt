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
        
        // Calculate average risk change for display
        const avgRisk = userRisks.length > 0 
          ? userRisks.reduce((acc: number, curr: RiskData) => acc + (curr.risk || 0), 0) / userRisks.length 
          : 0;

        // Get the primary condition (first one) for occupation field
        const primaryCondition = userRisks.length > 0 ? userRisks[0].condition : 'None';

        return {
          id: patient.user_id.toString(),
          name: patient.name || 'Unknown',
          age: patient.age || 0,
          gender: (patient.gender as 'Male' | 'Female' | 'Other') || 'Other',
          location: patient.location || 'Unknown',
          occupation: primaryCondition, // Using primary condition as occupation
          email: '', // Not available in current schema
          phone: '', // Not available in current schema
          avatar: '', // Not available in current schema
          change: avgRisk // Using the average risk as the change value
        };
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};