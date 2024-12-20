import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { isHighRisk, getFieldName } from '../tableConstants';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const getRiskColumns = (
  visibleRiskColumns: string[],
  averageRisks: { [key: string]: string }
): ColumnDef<Person>[] => 
  visibleRiskColumns.map((column): ColumnDef<Person> => ({
    accessorKey: getFieldName(column),
    header: ({ table }) => {      
      return (
        <div className="flex flex-col items-center pb-2">
          <Button
            variant="ghost"
            onClick={() => table.getColumn(getFieldName(column))?.toggleSorting(table.getColumn(getFieldName(column))?.getIsSorted() === "asc")}
            className="hover:bg-transparent whitespace-nowrap"
          >
            {column}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <div className="text-xs text-blue-400/70 bg-white px-2 py-0.5 rounded mt-0.5 shadow-sm">
            Avg: {averageRisks[column] || 'N/A'}
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
        return change.toFixed(1);
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
        return (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center min-w-[5rem]">
              <div className={`${isHighRisk(value) ? 'bg-red-100' : ''} w-16 text-center py-1 rounded`}>
                <span>{value.toFixed(1)}x</span>
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