import { Person } from '../types/population';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

interface DetailViewProps {
  person: Person | null;
}

export const DetailView = ({ person }: DetailViewProps) => {
  if (!person) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Select a person to view details
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="detail-card">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{person.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{person.name || 'Unknown'}</h2>
            <p className="text-gray-500">Patient ID: {person.patient_id}</p>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Age</span>
            <span>{person.age || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Gender</span>
            <span>{person.gender || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span>{person.location || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">MRN</span>
            <span>{person.mrn || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last Visit</span>
            <span>{person.last_visit || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <h3 className="text-lg font-semibold mb-4">Risk Factors</h3>
        <div className="space-y-2">
          {['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'].map((risk) => (
            <div key={risk} className="flex justify-between">
              <span className="text-gray-500">{risk}</span>
              <span>{person[risk as keyof Person]?.toFixed(2) || 'Not available'}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};