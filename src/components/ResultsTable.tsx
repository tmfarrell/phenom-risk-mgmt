import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Person } from '../types/population';
import { ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';

interface ResultsTableProps {
  data: Person[];
  onSelectPerson: (person: Person) => void;
}

type SortConfig = {
  key: keyof Person;
  direction: 'asc' | 'desc';
} | null;

export const ResultsTable = ({ data, onSelectPerson }: ResultsTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (key: keyof Person) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {['name', 'age', 'gender', 'location', 'occupation'].map((key) => (
              <TableHead key={key}>
                <Button
                  variant="ghost"
                  onClick={() => handleSort(key as keyof Person)}
                  className="hover:bg-transparent"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((person) => (
            <TableRow
              key={person.id}
              className="cursor-pointer hover:bg-muted/50 table-cell-fade"
              onClick={() => onSelectPerson(person)}
            >
              <TableCell>{person.name}</TableCell>
              <TableCell>{person.age}</TableCell>
              <TableCell>{person.gender}</TableCell>
              <TableCell>{person.location}</TableCell>
              <TableCell>{person.occupation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};