import { Table } from './ui/table';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Person } from '../types/population';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
  RowSelectionState,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { TableHeader } from './table/TableHeader';
import { TableBody } from './table/TableBody';
import { TablePagination } from './table/TablePagination';
import { useTableColumns } from './table/useTableColumns';

interface ResultsTableProps {
  data: Person[];
  visibleRiskColumns: string[];
  onSelectionChange?: (selectedPatients: Person[]) => void;
  averageRisks: {
    [timeframe: string]: {
      [riskFactor: string]: string;
    };
  };
  selectedTimeframe: string;
  onPatientClick?: (patientId: number) => void;
}

export const ResultsTable = ({ 
  data, 
  visibleRiskColumns,
  onSelectionChange,
  averageRisks,
  selectedTimeframe,
  onPatientClick
}: ResultsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'composite_risk', desc: true } // Default sort by composite_risk descending (highest to lowest)
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useTableColumns(visibleRiskColumns, averageRisks[selectedTimeframe] || {}, onPatientClick);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
      sorting: [
        { id: 'composite_risk', desc: true } // Default sort by composite_risk descending
      ],
    },
    getRowId: (row) => row.patient_id.toString(),
    autoResetPageIndex: false,
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedPatients = selectedRows.map(row => row.original);
      onSelectionChange(selectedPatients);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="w-full rounded-md border">
      <ScrollArea className="h-[600px] w-full" type="always">
        <div className="relative min-w-max">
          <Table className="min-w-full">
            <TableHeader table={table} />
            <TableBody table={table} columns={columns} />
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TablePagination table={table} />
    </div>
  );
};
