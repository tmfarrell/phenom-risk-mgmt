export interface Person {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  occupation: string;
  email: string;
  phone: string;
  avatar: string;
  change: number;  // New field for the floating point change
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}