import { ColumnDef } from '@tanstack/react-table';
import { Person } from '@/types/population';
import { getBaseColumns } from './columns/baseColumns';
import { getRiskColumns } from './columns/riskColumns';

export const useTableColumns = (
  visibleRiskColumns: string[],
  averageRisks: { [key: string]: string },
  onPatientClick?: (patientId: number) => void
) => {
  const baseColumns = getBaseColumns(onPatientClick);
  const riskColumns = getRiskColumns(visibleRiskColumns, averageRisks);

  return [...baseColumns, ...riskColumns];
};
