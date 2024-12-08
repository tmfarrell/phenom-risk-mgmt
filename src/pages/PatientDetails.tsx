import { DetailView } from '@/components/DetailView';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { useParams } from 'react-router-dom';
import { usePatientData } from '@/hooks/usePatientData';

export const PatientDetails = () => {
  const { id } = useParams();
  const { data: patients, isLoading, error } = usePatientData();
  
  console.log('PatientDetails - ID:', id);
  console.log('PatientDetails - All Patients:', patients);
  
  const person = patients?.find(p => p.patient_id === Number(id)) || null;
  
  console.log('PatientDetails - Selected Person:', person);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
        <Header />
        <TitleSection title="PhenOM Risk Management Dashboard" />
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
        <Header />
        <TitleSection title="PhenOM Risk Management Dashboard" />
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto">
            Error loading patient data
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-semibold mb-4 text-left">Patient Details</h2>
          <DetailView person={person} />
        </div>
      </div>
    </div>
  );
};