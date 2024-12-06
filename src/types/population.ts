export interface Person {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  occupation?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  change?: number;
  [key: string]: string | number | undefined; // Allow dynamic risk conditions
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}