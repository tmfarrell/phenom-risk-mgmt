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

  const calculateAverageRisks = (timeframe: number) => {
    const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
    const averages: { [key: string]: number } = {};

    riskFactors.forEach(factor => {
      const validValues = selectedPatientsData
        .filter(patient => 
          patient.prediction_timeframe_yrs === timeframe && 
          patient.risk_type === selectedRiskType &&
          patient[factor as keyof Person] !== null
        )
        .map(patient => patient[factor as keyof Person])
        .filter((value): value is number => typeof value === 'number');

      if (validValues.length > 0) {
        averages[factor] = validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
      } else {
        averages[factor] = 0; // Default to 0 if no valid values
      }
    });

    console.log(`Average risks for ${timeframe} year(s):`, averages);
    return averages;
  };

  const oneYearRisks = calculateAverageRisks(1);
  const fiveYearRisks = calculateAverageRisks(5);

  const handlePatientClick = (patientId: number) => {
    navigate(`/patient/${patientId}`, {
      state: { 
        from: 'panel',
        selectedPatients: selectedPatientsData.filter(p => p.patient_id === patientId)
      }
    });
  };

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
                      <h2 className="text-xl font-semibold">Average Risk Factors</h2>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 1 Year Risks */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">1 Year Risks</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(oneYearRisks).map(([factor, value]) => (
                            <div
                              key={factor}
                              className="p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md"
                            >
                              <h3 className="text-gray-600 text-sm mb-1">{factor}</h3>
                              <p className="text-2xl font-bold text-blue-600">
                                {value.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5 Year Risks */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">5 Year Risks</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(fiveYearRisks).map(([factor, value]) => (
                            <div
                              key={factor}
                              className="p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md"
                            >
                              <h3 className="text-gray-600 text-sm mb-1">{factor}</h3>
                              <p className="text-2xl font-bold text-blue-600">
                                {value.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
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