import { useLocation, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { Person } from '@/types/population';

export const PanelView = () => {
  const location = useLocation();
  const selectedPatients = location.state?.selectedPatients as Person[] || [];

  // Calculate average risks across selected patients
  const averageRisks = selectedPatients.reduce(
    (acc, patient) => {
      const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
      riskFactors.forEach((factor) => {
        if (patient[factor] !== null && patient[factor] !== undefined) {
          acc[factor] = (acc[factor] || 0) + (patient[factor] as number);
        }
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate the final averages
  Object.keys(averageRisks).forEach((key) => {
    averageRisks[key] = averageRisks[key] / selectedPatients.length;
  });

  console.log('Selected patients:', selectedPatients);
  console.log('Average risks:', averageRisks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
      <Header />
      <TitleSection title="Panel View" />
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
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Panel Summary ({selectedPatients.length} patients)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(averageRisks).map(([factor, value]) => (
                <div key={factor} className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">{factor}</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};