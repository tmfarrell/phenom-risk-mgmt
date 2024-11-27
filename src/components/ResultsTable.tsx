import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Person } from '../types/population';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';

interface ResultsTableProps {
  data: Person[];
  onSelectPerson: (person: Person) => void;
}

type SortConfig = {
  key: keyof Person;
  direction: 'asc' | 'desc';
} | null;

// Threshold for change value (can be adjusted as needed)
const CHANGE_THRESHOLD = 5.0;

// Helper function to ensure value is >= 1
const normalizeValue = (value: number): number => {
  return Math.abs(value) < 1 ? 1 + Math.abs(value) : Math.abs(value);
};

export const ResultsTable = ({ data, onSelectPerson }: ResultsTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const handleSelectPerson = (person: Person) => {
    setSelectedId(person.id);
    onSelectPerson(person);
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
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              {['name', 'age', 'gender', 'location', 'occupation', 'change'].map((key) => (
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
                className={`cursor-pointer hover:bg-muted/50 table-cell-fade ${
                  selectedId === person.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => handleSelectPerson(person)}
              >
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.age}</TableCell>
                <TableCell>{person.gender}</TableCell>
                <TableCell>{person.location}</TableCell>
                <TableCell>{person.occupation}</TableCell>
                <TableCell 
                  className={`flex items-center gap-2 ${
                    normalizeValue(person.change) > CHANGE_THRESHOLD ? 'text-red-500' : ''
                  }`}
                >
                  {person.change > 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  {`${normalizeValue(person.change).toFixed(2)}x (${person.change >= 0 ? '+' : ''}${person.change.toFixed(2)})`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};