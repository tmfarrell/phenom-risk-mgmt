import versionData from '@/config/version.json';

export interface Release {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export interface VersionData {
  current: string;
  releases: Release[];
}

export const useVersion = () => {
  const data = versionData as VersionData;
  
  // Format version with 'v' prefix for display
  const formattedVersion = `v${data.current}`;
  
  return {
    version: formattedVersion,
    currentVersion: data.current,
    releases: data.releases,
  };
};
