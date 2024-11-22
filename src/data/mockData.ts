import { Person } from '../types/population';

export const mockPeople: Person[] = [
  {
    id: '1',
    name: 'John Smith',
    age: 32,
    gender: 'Male',
    location: 'New York',
    occupation: 'Software Engineer',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 28,
    gender: 'Female',
    location: 'San Francisco',
    occupation: 'Product Manager',
    email: 'sarah.j@example.com',
    phone: '(555) 234-5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '3',
    name: 'Michael Chen',
    age: 45,
    gender: 'Male',
    location: 'Chicago',
    occupation: 'Data Scientist',
    email: 'michael.c@example.com',
    phone: '(555) 345-6789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
  }
];

export const locations = ['New York', 'San Francisco', 'Chicago', 'Los Angeles', 'Boston'];
export const occupations = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer', 'Marketing Manager'];