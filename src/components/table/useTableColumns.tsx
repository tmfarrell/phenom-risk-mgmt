
import { ColumnDef } from "@tanstack/react-table";
import { Person } from "@/types/population";
import { Checkbox } from "@/components/ui/checkbox";
import { getBaseColumns } from './columns/baseColumns';
import { getRiskColumns } from './columns/riskColumns';
import { useAppVersion } from '@/hooks/useAppVersion';
import { useVersionLabels } from '@/hooks/useVersionLabels';

export const useTableColumns = (
  visibleRiskColumns: string[],
  averageRisks: { [key: string]: string }
) => {
  const { mrnLabel } = useVersionLabels();
  
  // Modify the base columns to use the correct MRN label
  const modifiedBaseColumns: ColumnDef<Person>[] = [
    {
      id: "select",
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
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "mrn",
      header: mrnLabel,
      cell: ({ row }) => <div>{row.getValue("mrn")}</div>,
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => <div>{row.getValue("age")}</div>,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <div>{row.getValue("gender")}</div>,
    },
  ];

  // Filter risk columns based on visible ones and include average risk values
  const filteredRiskColumns = getRiskColumns(
    visibleRiskColumns,
    averageRisks,
  );

  // Combine base and risk columns
  return [...modifiedBaseColumns, ...filteredRiskColumns];
};
