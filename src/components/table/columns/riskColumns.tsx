
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
  averageRisks: { [key: string]: string },
  outcomeLabels?: Record<string, string>
): ColumnDef<Person>[] => 
  visibleRiskColumns.map((column): ColumnDef<Person> => ({
    accessorKey: column,
    accessorFn: (row) => {
      // Access the column value directly using the outcome code from phenom_models
      return row[column as keyof Person];
    },
    size: 120, // Set minimum width for risk columns
    minSize: 120,
    header: ({ table, column: tableColumn }) => {      
      const isSorted = tableColumn.getIsSorted();
      const label = outcomeLabels?.[column] || column;
      
      const handleThreeStateSorting = () => {
        const currentSort = tableColumn.getIsSorted();
        
        if (!currentSort) {
          // First click: sort ascending
          tableColumn.toggleSorting(false);
        } else if (currentSort === "asc") {
          // Second click: sort descending
          tableColumn.toggleSorting(true);
        } else {
          // Third click: return to default (composite_risk descending)
          table.setSorting([{ id: 'composite_risk', desc: true }]);
        }
      };
      
      return (
        <div className="flex flex-col align-center items-center pb-2 w-56 min-w-[14rem] max-w-[14rem]">
          <Button
            variant="ghost"
            onClick={handleThreeStateSorting}
            className="hover:bg-transparent whitespace-normal text-center leading-snug w-full"
          >
            <span className="break-words whitespace-normal leading-snug mt-2">
              {label}
            </span>
            {isSorted ? (
              isSorted === "asc" ? (
                <span className="ml-2 inline-flex items-center justify-center h-4 w-4 min-w-4 min-h-4 shrink-0">
                  <ArrowUp className="h-4 w-4 font-bold" />
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center justify-center h-4 w-4 min-w-4 min-h-4 shrink-0">
                  <ArrowDown className="h-4 w-4 font-bold" />
                </span>
              )
            ) : (
              <span className="ml-2 inline-flex items-center justify-center h-4 w-4 min-w-4 min-h-4 shrink-0">
                <ArrowUpDown className="h-4 w-4" />
              </span>
            )}
          </Button>
          {averageRisks[column] !== undefined && averageRisks[column] !== null && averageRisks[column] !== 'N/A' && (
            <div className="text-xs text-blue-400/70 bg-white px-2 py-0.5 rounded mt-2 shadow-sm">
              Avg: {averageRisks[column]}
            </div>
          )}
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.original[column as keyof Person];
      const riskType = row.original.risk_type;
      const changeField = `${column}_change` as keyof Person;
      const change = row.original[changeField] as number | null | undefined;
      const changeSince = row.original.change_since;

      // If value is null or undefined, return an empty string
      if (value === undefined || value === null || isNaN(value as number)) {
        return <span className="text-gray-300">Not in cohort</span>;
      }

      const formatChangeValue = (change: number | null | undefined, riskType: string) => {
        if (change === null || change === undefined) return 'N/A';
        if (riskType === 'absolute') {
          return `${change.toFixed(1)}%`;
        }
        return change.toFixed(2);
      };

      const getArrowColor = (change: number | null | undefined, riskType: string) => {
        if (change === null || change === undefined) return 'text-black';
        if (riskType === 'absolute') {
          if (change > 0.5) return 'text-red-500';
          if (change < -0.5) return 'text-green-500';
          return 'text-black';
        } else {
          if (change > 0.15) return 'text-red-500';
          if (change < -0.15) return 'text-green-500';
          return 'text-black';
        }
      };

      const renderChangeArrow = (change: number | null | undefined, threshold: number) => {
        if (!change || Math.abs(change) <= threshold) return null;

        const tooltipText = `${change > 0 ? '+' : ''}${formatChangeValue(change, riskType)} change from ${changeSince || 'unknown date'}`;
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
        return (
          <div className="flex items-center justify-center w-56 min-w-[14rem] max-w-[14rem]">
            <div className="flex items-center w-full justify-center">
              <div className={`${Number(value) > 15 ? 'bg-red-100' : ''} w-16 text-center py-1 rounded`}>
                <span>{Number(value).toFixed(1)}%</span>
              </div>
              <div className="w-4 ml-2">
                {renderChangeArrow(change, 0.25)}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex items-center justify-center w-56 min-w-[14rem] max-w-[14rem]">
            <div className="flex items-center w-full justify-center">
              <div className={`${isHighRisk(Number(value)) ? 'bg-red-100' : ''} w-16 text-center py-1 rounded`}>
                <span>{Number(value).toFixed(2)}<span>×</span></span>
              </div>
              <div className="w-4 ml-2">
                {renderChangeArrow(change, 0.1)}
              </div>
            </div>
          </div>
        );
      }
    },
    enableColumnFilter: true,
  }));
