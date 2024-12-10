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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Panel() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPatientIds = (location.state?.selectedPatients as Person[] || []).map(p => p.patient_id);
  const { data: allPatientData } = usePatientData();
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');

  // Filter all patient data to only include selected patients and their risks
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

          <div className="detail-card">
            <h1 className="text-2xl font-bold mb-6">Panel Overview</h1>
            <div className="mb-4">
              <p className="text-gray-600">
                Selected Patients: {selectedPatientIds.length}
              </p>
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

                    <div className="h-[400px] w-full">
                      <ChartContainer
                        className="h-full"
                        config={{
                          primary: {
                            theme: {
                              light: "hsl(var(--primary))",
                              dark: "hsl(var(--primary))",
                            },
                          },
                        }}
                      >
                        <ComposedChart
                          data={chartData}
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 60,
                            left: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="factor" angle={-45} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-semibold">{label}</p>
                                  {[1, 5].map(timeframe => (
                                    <div key={timeframe} className="mt-2">
                                      <p className="font-medium">{timeframe} Year:</p>
                                      <p>Min: {payload[0].payload[`${timeframe}yr_min`]?.toFixed(2)}</p>
                                      <p>Q1: {payload[0].payload[`${timeframe}yr_q1`]?.toFixed(2)}</p>
                                      <p>Median: {payload[0].payload[`${timeframe}yr_median`]?.toFixed(2)}</p>
                                      <p>Q3: {payload[0].payload[`${timeframe}yr_q3`]?.toFixed(2)}</p>
                                      <p>Max: {payload[0].payload[`${timeframe}yr_max`]?.toFixed(2)}</p>
                                    </div>
                                  ))}
                                </div>
                              );
                            }}
                          />
                          <Legend />
                          {/* 1 Year Bars */}
                          <Bar
                            dataKey="1yr_median"
                            fill="#60A5FA"
                            name="1 Year Risk"
                            barSize={20}
                          />
                          {/* 5 Year Bars */}
                          <Bar
                            dataKey="5yr_median"
                            fill="#3B82F6"
                            name="5 Year Risk"
                            barSize={20}
                          />
                        </ComposedChart>
                      </ChartContainer>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 glass-card">
                  <h2 className="text-xl font-semibold mb-4">Selected Patients</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from(new Set(selectedPatientsData.map(p => p.patient_id))).map((patientId) => {
                      const patient = selectedPatientsData.find(p => p.patient_id === patientId);
                      if (!patient) return null;
                      return (
                        <div
                          key={patientId}
                          onClick={() => handlePatientClick(patientId)}
                          className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer hover:bg-white/70"
                        >
                          <p className="font-semibold text-sm truncate">{patient.name}</p>
                          <p className="text-gray-500 text-xs">ID: {patientId}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}