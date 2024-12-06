export interface Person {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  [key: string]: string | number; // Allow dynamic risk conditions
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}