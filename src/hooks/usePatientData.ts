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
            EMERGENCY_VISIT: null,
            HOSPITALIZATION: null,
            FALL: null,
            STROKE: null,
            INFARCTION: null,
            EMERGENCY_VISIT_change: null,
            HOSPITALIZATION_change: null,
            FALL_change: null,
            STROKE_change: null,
            INFARCTION_change: null,
            recorded_date: null,
            prediction_timeframe_yrs: null,
            risk_type: null,
            change_since: null
          }];
        }
        
        // Return an entry for each risk record
        return patientRisks.map(risk => {
          console.log('Processing risk record:', risk); // Debug log
          return {
            ...patient,
            EMERGENCY_VISIT: risk.EMERGENCY_VISIT || null,
            HOSPITALIZATION: risk.HOSPITALIZATION || null,
            FALL: risk.FALL || null,
            STROKE: risk.STROKE || null,
            INFARCTION: risk.INFARCTION || null,
            EMERGENCY_VISIT_change: risk.EMERGENCY_VISIT_change || null,
            HOSPITALIZATION_change: risk.HOSPITALIZATION_change || null,
            FALL_change: risk.FALL_change || null,
            STROKE_change: risk.STROKE_change || null,
            INFARCTION_change: risk.INFARCTION_change || null,
            recorded_date: risk.calculated_date,
            prediction_timeframe_yrs: risk.time_period,
            risk_type: (risk.risk_type as 'relative' | 'absolute' | null) || null,
            change_since: risk.change_since || null
          };
        });
      });

      console.log('Transformed data:', transformedData);
      return transformedData;
    }
  });
};