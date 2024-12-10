import { useLocation } from 'react-router-dom';
import { Person } from '@/types/population';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';

export default function Panel() {
  const location = useLocation();
  const selectedPatients = location.state?.selectedPatients as Person[] || [];

  // Calculate average risks across selected patients
  const calculateAverageRisks = () => {
    const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
    const averages: { [key: string]: number } = {};

    riskFactors.forEach(factor => {
      const validValues = selectedPatients
        .map(patient => patient[factor as keyof Person])
        .filter((value): value is number => typeof value === 'number');

      if (validValues.length > 0) {
        averages[factor] = validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
      }
    });

    return averages;
  };

  const averageRisks = calculateAverageRisks();

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
                Selected Patients: {selectedPatients.length}
              </p>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                <Card className="p-4 glass-card">
                  <h2 className="text-xl font-semibold mb-4">Average Risk Factors</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(averageRisks).map(([factor, value]) => (
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
                </Card>

                <Card className="p-4 glass-card">
                  <h2 className="text-xl font-semibold mb-4">Selected Patients</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedPatients.map((patient) => (
                      <div
                        key={patient.patient_id}
                        className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md"
                      >
                        <p className="font-semibold text-sm truncate">{patient.name}</p>
                        <p className="text-gray-500 text-xs">ID: {patient.patient_id}</p>
                      </div>
                    ))}
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
