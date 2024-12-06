import { useParams } from 'react-router-dom';
import { DetailView } from '@/components/DetailView';
import { mockPeople } from '@/data/mockData';

export default function PatientDetails() {
  const { id } = useParams();
  const person = mockPeople.find(p => p.id === id) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Patient Details</h1>
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
        <DetailView person={person} />
      </div>
    </div>
  );
}