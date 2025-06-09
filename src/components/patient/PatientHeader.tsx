
import { Person } from '@/types/population';
import { useAppVersion } from '@/hooks/useAppVersion';
import { useState } from 'react';

interface PatientHeaderProps {
  person: Person;
}

export const PatientHeader = ({ person }: PatientHeaderProps) => {
  const { appVersion } = useAppVersion();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true) // Open by default
  
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

      {person.history && person.history.trim() !== '' && (
                <div className='mt-3'>
                    <button
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        className='flex items-center w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors'
                    >
                        <span className='text-gray-500 font-medium'>Clinical History Summary</span>
                        <svg
                            className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${isHistoryExpanded ? 'rotate-90' : 'rotate-0'}`}
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                    </button>
                    {isHistoryExpanded && (
                        <div className='mt-2 p-4 bg-gray-50 rounded-lg'>
                            <p className='text-sm text-gray-700 leading-relaxed text-left'>{person.history}</p>
                        </div>
                    )}
                </div>
            )}

    </div>
  );
};
