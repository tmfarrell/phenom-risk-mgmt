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

const CHANGE_THRESHOLD = 5.0;

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
    <div className="rounded-md border relative">
      <div className="flex">
        {/* Frozen first column */}
        <div className="z-20 bg-background border-r">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="hover:bg-transparent"
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((person) => (
                <TableRow
                  key={`name-${person.id}`}
                  className={`cursor-pointer hover:bg-muted/50 table-cell-fade ${
                    selectedId === person.id ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleSelectPerson(person)}
                >
                  <TableCell>{person.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {['age', 'gender', 'location', 'occupation', 'change'].map((key) => (
                  <TableHead key={key}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(key as keyof Person)}
                      className="hover:bg-transparent whitespace-nowrap"
                    >
                      {key === 'change' ? 'Relative Risk' : key.charAt(0).toUpperCase() + key.slice(1)}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((person) => (
                <TableRow
                  key={`content-${person.id}`}
                  className={`cursor-pointer hover:bg-muted/50 table-cell-fade ${
                    selectedId === person.id ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleSelectPerson(person)}
                >
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
                    {`${normalizeValue(person.change).toFixed(2)}x (${person.change >= 0 ? '+' : ''}${(person.change * 0.3).toFixed(2)})`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};