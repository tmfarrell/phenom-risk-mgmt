
import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppVersion } from '@/hooks/useAppVersion';

export const getBaseColumns = (): ColumnDef<Person>[] => {
  // Get current app version to determine label text
  const { appVersion } = useAppVersion();
  
  // Set MRN label based on app version
  const mrnLabel = appVersion === 'patient' ? 'MRN' : 'Subject ID';
  
  return [
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
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            Name
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4 font-bold" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4 font-bold" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left">
          <Link
            to={`/patient/${row.original.patient_id}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {row.getValue('name')}
          </Link>
          <div className="text-xs text-gray-500">
            {mrnLabel}: {row.original.mrn || 'N/A'}
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
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent whitespace-nowrap"
          >
            Last Visit
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4 font-bold" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4 font-bold" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => row.getValue('last_visit') || 'N/A',
    },
  ];
};
