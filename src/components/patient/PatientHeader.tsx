import { Person } from '@/types/population';

interface PatientHeaderProps {
  person: Person;
}

export const PatientHeader = ({ person }: PatientHeaderProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-left mb-4">
        {person.name || 'Unknown'}
      </h2>
      <div className="grid grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-gray-500 font-medium mb-1">MRN</p>
          <p>{person.mrn || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">DOB</p>
          <p>{person.dob || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Age</p>
          <p>{person.age || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Sex</p>
          <p>{person.gender || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Last Visit</p>
          <p>{person.last_visit || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};