import { useLocation, useNavigate } from 'react-router-dom';
import { Person } from '@/types/population';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { usePatientData } from '@/hooks/usePatientData';
import { RiskFactorsChart } from '@/components/panel/RiskFactorsChart';
import { PatientList } from '@/components/panel/PatientList';

export default function Panel() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPatientIds = (location.state?.selectedPatients as Person[] || []).map(p => p.patient_id);
  const { data: allPatientData } = usePatientData();
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');

  const selectedPatientsData = allPatientData?.filter(patient => 
    selectedPatientIds.includes(patient.patient_id)
  ) || [];

  console.log('Selected patients data:', selectedPatientsData);

  const calculateBoxPlotData = () => {
    const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
    const timeframes = [1, 5];
    const chartData: any[] = [];

    riskFactors.forEach(factor => {
      const dataPoint: any = { factor };
      
      timeframes.forEach(timeframe => {
        const values = selectedPatientsData
          .filter(patient => 
            patient.prediction_timeframe_yrs === timeframe && 
            patient.risk_type === selectedRiskType &&
            patient[factor as keyof Person] !== null
          )
          .map(patient => patient[factor as keyof Person] as number)
          .sort((a, b) => a - b);

        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const q1 = values[Math.floor(values.length * 0.25)];
          const median = values[Math.floor(values.length * 0.5)];
          const q3 = values[Math.floor(values.length * 0.75)];

          dataPoint[`${timeframe}yr_min`] = min;
          dataPoint[`${timeframe}yr_q1`] = q1;
          dataPoint[`${timeframe}yr_median`] = median;
          dataPoint[`${timeframe}yr_q3`] = q3;
          dataPoint[`${timeframe}yr_max`] = max;
        }
      });

      chartData.push(dataPoint);
    });

    console.log('Chart data:', chartData);
    return chartData;
  };

  const handlePatientClick = (patientId: number) => {
    navigate(`/patient/${patientId}`, {
      state: { 
        from: 'panel',
        selectedPatients: selectedPatientsData.filter(p => p.patient_id === patientId)
      }
    });
  };

  const chartData = calculateBoxPlotData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
      <Header />
      <TitleSection title="PhenOM Risk Management Dashboard" />
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-end mb-6">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-6">Panel Overview</h1>
              <div className="mb-4">
                <p className="text-gray-600">
                  Selected Patients: {selectedPatientIds.length}
                </p>
              </div>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                <Card className="p-4 glass-card">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Risk Factors Summary</h2>
                      <ToggleGroup 
                        type="single" 
                        value={selectedRiskType}
                        onValueChange={(value) => {
                          if (value) setSelectedRiskType(value as 'relative' | 'absolute');
                        }}
                        className="flex gap-2"
                      >
                        <ToggleGroupItem 
                          value="relative" 
                          className={cn(
                            "px-4 py-2 rounded-md",
                            selectedRiskType === 'relative' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
                          )}
                        >
                          Relative
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="absolute"
                          className={cn(
                            "px-4 py-2 rounded-md",
                            selectedRiskType === 'absolute' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
                          )}
                        >
                          Absolute
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    <RiskFactorsChart 
                      chartData={chartData}
                      selectedRiskType={selectedRiskType}
                    />
                  </div>
                </Card>

                <PatientList 
                  selectedPatientsData={selectedPatientsData}
                  onPatientClick={handlePatientClick}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}