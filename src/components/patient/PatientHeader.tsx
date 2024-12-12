import { Person } from '@/types/population';

interface PatientHeaderProps {
  person: Person;
}

export const PatientHeader = ({ person }: PatientHeaderProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-left mb-2">
        {person.name || 'Unknown'}
        <span className="font-normal">
          {person.age && person.gender ? ` (${person.age}${person.gender?.[0]})` : ''}
        </span>
      </h2>
      <p className="text-gray-500 text-left mb-6">
        MRN: {person.mrn || 'N/A'} | DOB: {person.dob || 'N/A'} | Last visit: {person.last_visit || 'N/A'}
      </p>
    </div>
  );
};