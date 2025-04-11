
import { useAppVersion } from './useAppVersion';

export const useVersionLabels = () => {
  const { appVersion } = useAppVersion();
  
  // Return different labels based on app version
  const isSafetyVersion = appVersion === 'safety';
  
  return {
    // Patient identifiers
    mrnLabel: isSafetyVersion ? 'Subject ID' : 'MRN',
    
    // Time periods (with conversion for safety version)
    getTimePeriodLabel: (years: string | number) => {
      if (isSafetyVersion) {
        const months = Number(years) * 12;
        return `${months} month${months !== 1 ? 's' : ''}`;
      }
      return `${years} year${Number(years) !== 1 ? 's' : ''}`;
    },
    
    // Convert time periods for display
    convertTimePeriod: (years: string | number) => {
      if (isSafetyVersion) {
        return Number(years) * 12;
      }
      return years;
    },
    
    // Format time period with unit
    formatTimePeriodWithUnit: (value: string | number) => {
      if (isSafetyVersion) {
        const months = Number(value) * 12;
        return `${months} month${months !== 1 ? 's' : ''}`;
      }
      return `${value} year${Number(value) !== 1 ? 's' : ''}`;
    },
    
    // Intervention label
    interventionLabel: isSafetyVersion ? 'Cohort' : 'Intervention',
    
    // Check if we're in safety mode
    isSafetyVersion
  };
};
