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
import { ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface ResultsTableProps {
  data: Person[];
}

type SortConfig = {
  key: keyof Person;
  direction: 'asc' | 'desc';
} | null;

const RISK_COLUMNS = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'] as const;

export const ResultsTable = ({ data }: ResultsTableProps) => {
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

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="hover:bg-transparent"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('mrn')}
                  className="hover:bg-transparent"
                >
                  MRN
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {RISK_COLUMNS.map((column) => (
                <TableHead key={column}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column as keyof Person)}
                    className="hover:bg-transparent whitespace-nowrap"
                  >
                    {column}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((person) => (
              <TableRow key={person.patient_id}>
                <TableCell className="sticky left-0 bg-background">
                  <Link 
                    to={`/patient/${person.name}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {person.name}
                  </Link>
                </TableCell>
                <TableCell>{person.mrn || 'N/A'}</TableCell>
                {RISK_COLUMNS.map((column) => (
                  <TableCell key={column}>
                    {person[column] !== undefined && person[column] !== null
                      ? Number(person[column]).toFixed(2)
                      : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};