import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isHighRisk } from './tableConstants';

export const useTableColumns = (visibleRiskColumns: string[]) => {
  const baseColumns: ColumnDef<Person>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          to={`/patient/${row.original.patient_id}`}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {row.getValue('name')}
        </Link>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'mrn',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          MRN
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('mrn') || 'N/A',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'last_visit',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent whitespace-nowrap"
        >
          Last Visit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('last_visit') || 'N/A',
    },
  ];

  const riskColumns: ColumnDef<Person>[] = visibleRiskColumns.map((column): ColumnDef<Person> => ({
    accessorKey: column,
    header: ({ column: tableColumn }) => (
      <Button
        variant="ghost"
        onClick={() => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc")}
        className="hover:bg-transparent whitespace-nowrap"
      >
        {column}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue(column) as number;
      const riskType = row.original.risk_type;

      if (value === undefined || value === null) {
        return 'N/A';
      }

      // Format based on risk type
      if (riskType === 'absolute') {
        const roundedValue = Math.round(value);
        const isHighAbsoluteRisk = roundedValue > 50;
        return (
          <div className={`${isHighAbsoluteRisk ? 'bg-red-100' : ''} whitespace-nowrap px-2`}>
            {`${roundedValue}%`}
          </div>
        );
      } else {
        // For relative risk, keep the existing formatting
        return (
          <div className={`${isHighRisk(value) ? 'bg-red-100' : ''} whitespace-nowrap px-2`}>
            {value.toFixed(2)}
          </div>
        );
      }
    },
    enableColumnFilter: true,
  }));

  return [...baseColumns, ...riskColumns];
};
