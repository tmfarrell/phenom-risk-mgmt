import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { Button } from '../ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isHighRisk, getFieldName } from './tableConstants';
import { Checkbox } from '../ui/checkbox';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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

  const calculateAverageRisk = (data: Person[], field: string): string => {
    const absoluteRisks = data.filter(person => 
      person.risk_type === 'absolute' && 
      person[field as keyof Person] !== null
    ).map(person => person[field as keyof Person] as number);

    if (absoluteRisks.length === 0) return 'N/A';
    
    const average = absoluteRisks.reduce((sum, risk) => sum + risk, 0) / absoluteRisks.length;
    return `${Math.round(average)}%`;
  };

  const riskColumns: ColumnDef<Person>[] = visibleRiskColumns.map((column): ColumnDef<Person> => ({
    accessorKey: getFieldName(column),
    header: ({ table }) => {
      const averageRisk = calculateAverageRisk(table.getCoreRowModel().rows.map(row => row.original), getFieldName(column));
      
      return (
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            onClick={() => table.getColumn(getFieldName(column))?.toggleSorting(table.getColumn(getFieldName(column))?.getIsSorted() === "asc")}
            className="hover:bg-transparent whitespace-nowrap"
          >
            {column}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded mt-1">
            Avg: {averageRisk}
          </div>
        </div>
      );
    },
    cell: ({ row }) => {
      const fieldName = getFieldName(column);
      const value = row.getValue(fieldName) as number;
      const riskType = row.original.risk_type;
      const changeField = `${fieldName}_change` as keyof Person;
      const change = row.original[changeField] as number;
      const changeSince = row.original.change_since;

      if (value === undefined || value === null) {
        return 'N/A';
      }

      const formatChangeValue = (change: number, riskType: string) => {
        if (riskType === 'absolute') {
          return `${Math.round(change)}%`;
        }
        return change.toFixed(2);
      };

      const getArrowColor = (change: number, riskType: string) => {
        if (riskType === 'absolute') {
          if (change > 15) return 'text-red-500';
          if (change < -15) return 'text-green-500';
          return 'text-black';
        } else {
          if (change > 0.75) return 'text-red-500';
          if (change < -0.75) return 'text-green-500';
          return 'text-black';
        }
      };

      const renderChangeArrow = (change: number, threshold: number) => {
        if (Math.abs(change) <= threshold) return null;

        const tooltipText = `${formatChangeValue(change, riskType)} change from ${changeSince || 'unknown date'}`;
        const arrowColor = getArrowColor(change, riskType);

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {change > 0 
                  ? <ArrowUp className={`h-4 w-4 ${arrowColor}`} />
                  : <ArrowDown className={`h-4 w-4 ${arrowColor}`} />
                }
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      };

      // Format based on risk type
      if (riskType === 'absolute') {
        const roundedValue = Math.round(value);
        const isHighAbsoluteRisk = roundedValue > 50;
        return (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center min-w-[5rem]">
              <div className={`${isHighAbsoluteRisk ? 'bg-red-100' : ''} w-16 text-center py-1 rounded`}>
                <span>{`${roundedValue}%`}</span>
              </div>
              <div className="w-4 ml-2">
                {renderChangeArrow(change, 5)}
              </div>
            </div>
          </div>
        );
      } else {
        // For relative risk
        return (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center min-w-[5rem]">
              <div className={`${isHighRisk(value) ? 'bg-red-100' : ''} w-16 text-center py-1 rounded`}>
                <span>{value.toFixed(2)}</span>
              </div>
              <div className="w-4 ml-2">
                {renderChangeArrow(change, 0.3)}
              </div>
            </div>
          </div>
        );
      }
    },
    enableColumnFilter: true,
  }));

  return [...baseColumns, ...riskColumns];
};