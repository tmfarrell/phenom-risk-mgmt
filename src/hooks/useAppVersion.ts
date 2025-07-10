
import { useState, useEffect } from 'react';

type AppVersion = 'patient' | 'safety' | 'cohort' | 'payor';

export const useAppVersion = () => {
  const [appVersion, setAppVersion] = useState<AppVersion>('payor');
  
  useEffect(() => {
    // Load the app version from localStorage on mount
    const savedVersion = localStorage.getItem('appVersion') as AppVersion | null;
    if (savedVersion) {
      setAppVersion(savedVersion);
    } else {
      // Set default to 'payor' if no version is saved
      localStorage.setItem('appVersion', 'payor');
    }
    
    // Listen for storage events to update the state if changed in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'appVersion' && event.newValue) {
        setAppVersion(event.newValue as AppVersion);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const updateAppVersion = (version: AppVersion) => {
    localStorage.setItem('appVersion', version);
    setAppVersion(version);
  };
  
  return { appVersion, updateAppVersion };
};
