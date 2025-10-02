import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { getBaseColumns } from './columns/baseColumns';
import { getRiskColumns } from './columns/riskColumns';

export const useTableColumns = (
  visibleRiskColumns: string[],
  averageRisks: { [key: string]: string },
  onPatientClick?: (patientId: number) => void,
  outcomeLabels?: Record<string, string>
) => {
  const baseColumns = getBaseColumns(onPatientClick);
  // Ensure risk columns are ordered alphabetically by display label (model name),
  // falling back to outcome code when label is unavailable
  const orderedVisibleRiskColumns = [...visibleRiskColumns].sort((a, b) => {
    const aLabel = outcomeLabels?.[a] || a;
    const bLabel = outcomeLabels?.[b] || b;
    return aLabel.localeCompare(bLabel);
  });
  const riskColumns = getRiskColumns(orderedVisibleRiskColumns, averageRisks, outcomeLabels);

  return [...baseColumns, ...riskColumns];
};
