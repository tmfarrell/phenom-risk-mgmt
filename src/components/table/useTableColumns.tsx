import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isHighRisk } from './tableConstants';
import { Checkbox } from '../ui/checkbox';

export const useTableColumns = (visibleRiskColumns: string[]) => {
  const baseColumns: ColumnDef<Person>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
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
        <div className="text-left">
          <Link
            to={`/patient/${row.original.patient_id}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {row.getValue('name')}
          </Link>
          <div className="text-xs text-gray-500">
            MRN: {row.original.mrn || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            DOB: {row.original.dob || 'N/A'}
          </div>
        </div>
      ),
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
