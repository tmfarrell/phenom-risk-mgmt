
import { Person } from '@/types/population';
import { useAppVersion } from '@/hooks/useAppVersion';

interface PatientHeaderProps {
  person: Person;
}

export const PatientHeader = ({ person }: PatientHeaderProps) => {
  const { appVersion } = useAppVersion();
  
  // Determine if the MRN field should be labeled as MRN or Subject ID
  const mrnLabel = appVersion === 'patient' ? 'MRN' : 'Subject ID';
  
  const ageGenderString = person.age && person.gender 
    ? ` (${person.age}${person.gender?.[0]})`
    : '';

  return (
    <div className="mb-4">
      <h2 className="text-2xl text-left mb-2">
        <span className="font-bold">{person.name || 'Unknown'}</span>
        <span className="font-normal">{ageGenderString}</span>
      </h2>
      <div className="grid grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-gray-500 font-medium mb-0.5">{mrnLabel}</p>
          <p>{person.mrn || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-0.5">DOB</p>
          <p>{person.dob || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-0.5">Age</p>
          <p>{person.age || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-0.5">Sex</p>
          <p>{person.gender || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-0.5">Last Visit</p>
          <p>{person.last_visit || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};
