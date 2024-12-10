import { useLocation } from 'react-router-dom';
import { Person } from '@/types/population';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Panel() {
  const location = useLocation();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Panel Overview</h1>
          <div className="mb-4">
            <p className="text-gray-600">
              Selected Patients: {selectedPatients.length}
            </p>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-6">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Average Risk Factors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(averageRisks).map(([factor, value]) => (
                    <div
                      key={factor}
                      className="p-4 rounded-lg bg-white shadow"
                    >
                      <h3 className="text-gray-600 mb-2">{factor}</h3>
                      <p className="text-2xl font-bold">
                        {value.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Selected Patients</h2>
                <div className="space-y-4">
                  {selectedPatients.map((patient) => (
                    <div
                      key={patient.patient_id}
                      className="p-4 rounded-lg bg-white shadow"
                    >
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-gray-600">ID: {patient.patient_id}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}