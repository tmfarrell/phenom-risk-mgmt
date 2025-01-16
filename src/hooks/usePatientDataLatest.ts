import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types/population';
import { useEffect, useState } from 'react';

export const usePatientDataLatest = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return useQuery({
    queryKey: ['patients-latest'],
    queryFn: async () => {
      console.log('Fetching latest patient data...');
      
      if (!session) {
        throw new Error('No authenticated session');
      }
      
      // Fetch patients with authentication
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
        const key = `${risk.patient_id}-${risk.risk_type}-${risk.prediction_timeframe_yrs}`;
        if (!acc[key] || new Date(risk.calculated_date || '') > new Date(acc[key].calculated_date || '')) {
          acc[key] = risk;
        }
        return acc;
      }, {} as Record<string, any>);

      // Transform data to match Person interface
      const transformedData: Person[] = (patients || []).flatMap((patient) => {
        const patientLatestRisks = Object.values(latestRisks || {})
          .filter((risk: any) => risk.patient_id === patient.patient_id);

        // If no risks found for patient, return single entry with null values
        if (patientLatestRisks.length === 0) {
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

        // Return an entry for each unique risk type and timeframe combination
        return patientLatestRisks.map((risk: any) => ({
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

      console.log('Transformed latest data:', transformedData);
      return transformedData;
    },
    enabled: !!session // Only run query when session exists
  });
};