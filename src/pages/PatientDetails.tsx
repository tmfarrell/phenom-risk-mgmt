import { DetailView } from '@/components/DetailView';
import { Header } from '@/components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientData } from '@/hooks/usePatientData';

export const PatientDetails = () => {
  const { id } = useParams();
  const { data: patients, isLoading, error } = usePatientData();
  const navigate = useNavigate();
  
  const person = patients?.find(p => p.patient_id === Number(id)) || null;

  const handleBack = () => {
    // State is persisted in Zustand store, just navigate back
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <Header />
        <div className="flex items-start">
          <div className="px-6 pt-6">
            <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Details</h1>
          </div>
        </div>
        <div className="p-6">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full">
        <Header />
        <div className="flex items-start">
          <div className="px-6 pt-6">
            <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Details</h1>
          </div>
        </div>
        <div className="p-6">
          Error loading patient data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="flex items-start">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Details</h1>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="flex items-center justify-end mb-6">
          <button 
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <DetailView person={person} />
      </div>
    </div>
  );
};