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

      // Fetch risk data and order by calculated_date
      const { data: risks, error: risksError } = await supabase
        .from('phenom_risk')
        .select('*')
        .order('calculated_date', { ascending: false });

      if (risksError) {
        console.error('Error fetching risks:', risksError);
        throw risksError;
      }

      console.log('Raw data:', { patients, risks });

      // Transform data to match Person interface
      const transformedData: Person[] = (patients || []).flatMap((patient) => {
        const patientRisks = risks?.filter(risk => risk.patient_id === patient.patient_id) || [];
        
        // If no risks found for patient, return single entry with null values
        if (patientRisks.length === 0) {
          return [{
            ...patient,
            ED: null,
            Hospitalization: null,
            Fall: null,
            Stroke: null,
            MI: null,
            ED_change: null,
            Hospitalization_change: null,
            Fall_change: null,
            Stroke_change: null,
            MI_change: null,
            recorded_date: null,
            prediction_timeframe_yrs: null,
            risk_type: null,
            change_since: null
          }];
        }
        
        // Return an entry for each risk record
        return patientRisks.map(risk => ({
          ...patient,
          ED: risk.ED,
          Hospitalization: risk.Hospitalization,
          Fall: risk.Fall,
          Stroke: risk.Stroke,
          MI: risk.MI,
          ED_change: risk.ED_change,
          Hospitalization_change: risk.Hospitalization_change,
          Fall_change: risk.Fall_change,
          Stroke_change: risk.Stroke_change,
          MI_change: risk.MI_change,
          recorded_date: risk.calculated_date,
          prediction_timeframe_yrs: risk.prediction_timeframe_yrs,
          risk_type: risk.risk_type,
          change_since: risk.change_since
        }));
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};