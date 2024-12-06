import { Person } from '../types/population';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
            <AvatarImage src={person.avatar || ''} />
            <AvatarFallback>{person.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{person.name}</h2>
            <p className="text-gray-500">{person.occupation || 'Not specified'}</p>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Age</span>
            <span>{person.age}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Gender</span>
            <span>{person.gender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span>{person.location}</span>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-sm">{person.email || 'Not available'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span>{person.phone || 'Not available'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};