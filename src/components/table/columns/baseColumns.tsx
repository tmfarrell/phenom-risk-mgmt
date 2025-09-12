import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppVersion } from '@/hooks/useAppVersion';

export const getBaseColumns = (onPatientClick?: (patientId: number) => void): ColumnDef<Person>[] => {
  // Get current app version to determine label text
  const { appVersion } = useAppVersion();
  
  // Set MRN label based on app version
  const mrnLabel = (appVersion === 'patient' || appVersion === 'payor') ? 'MRN' : 'Subject ID';
  
  const columns: ColumnDef<Person>[] = [
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
      size: 50,
      minSize: 50,
    },
    {
      accessorKey: 'name',
      header: ({ table, column }) => {
        const isSorted = column.getIsSorted();
        
        const handleThreeStateSorting = () => {
          const currentSort = column.getIsSorted();
          
          if (!currentSort) {
            // First click: sort ascending
            column.toggleSorting(false);
          } else if (currentSort === "asc") {
            // Second click: sort descending
            column.toggleSorting(true);
          } else {
            // Third click: return to default (composite_risk descending)
            table.setSorting([{ id: 'composite_risk', desc: true }]);
          }
        };
        
        return (
          <Button
            variant="ghost"
            onClick={handleThreeStateSorting}
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
          {onPatientClick ? (
            <button
              onClick={() => onPatientClick(row.original.patient_id)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {row.getValue('name')}
            </button>
          ) : (
            <Link
              to={`/patient/${row.original.patient_id}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {row.getValue('name')}
            </Link>
          )}
          <div className="text-xs text-gray-500">
            {mrnLabel}: {row.original.mrn || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            DOB: {row.original.dob || 'N/A'}
          </div>
        </div>
      ),
      enableColumnFilter: true,
      size: 200,
      minSize: 180,
    },
    {
      // Hidden column for composite_risk sorting
      accessorKey: 'composite_risk',
      header: () => null,
      cell: () => null,
      enableSorting: true,
      enableColumnFilter: false,
      enableHiding: false,
      // This column will not be visible but allows sorting by composite_risk
      size: 0,
    },
  ];

  // Add provider column only for patient version (Provider Risk Panel)
  if (appVersion === 'patient') {
    columns.push({
      accessorKey: 'provider',
      header: ({ table, column }) => {
        const isSorted = column.getIsSorted();
        
        const handleThreeStateSorting = () => {
          const currentSort = column.getIsSorted();
          
          if (!currentSort) {
            // First click: sort ascending
            column.toggleSorting(false);
          } else if (currentSort === "asc") {
            // Second click: sort descending
            column.toggleSorting(true);
          } else {
            // Third click: return to default (composite_risk descending)
            table.setSorting([{ id: 'composite_risk', desc: true }]);
          }
        };
        
        return (
          <Button
            variant="ghost"
            onClick={handleThreeStateSorting}
            className="hover:bg-transparent whitespace-nowrap"
          >
            Provider
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
          <div>{row.getValue('provider') || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            NPI: {row.original.provider_npi || 'N/A'}
          </div>
        </div>
      ),
      size: 150,
      minSize: 130,
    });
  }

  return columns;
};
