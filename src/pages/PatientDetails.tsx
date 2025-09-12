import { DetailView } from '@/components/DetailView';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePatientData } from '@/hooks/usePatientData';

export const PatientDetails = () => {
  const { id } = useParams();
  const { data: patients, isLoading, error } = usePatientData();
  const navigate = useNavigate();
  const location = useLocation();
  const savedState = location.state as {
    selectedRiskColumns?: string[];
    selectedTimeframe?: string;
    selectedRiskType?: 'relative' | 'absolute';
  } | null;
  
  console.log('PatientDetails - ID:', id);
  console.log('PatientDetails - All Patients:', patients);
  console.log('PatientDetails - Location:', location);
  
  const person = patients?.find(p => p.patient_id === Number(id)) || null;
  
  console.log('PatientDetails - Selected Person:', person);

  const handleBack = () => {
    if (location.state) {
      navigate('/', { state: location.state });
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-start">
          <div className="px-6 pt-6">
            <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Details</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="max-w-[1250px] mx-auto">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-start">
          <div className="px-6 pt-6">
            <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Details</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="max-w-[1250px] mx-auto">
            Error loading patient data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-start">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Details</h1>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="max-w-[1250px] mx-auto">
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
    </div>
  );
};