import { Table } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Person } from '../types/population';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import { TableHeader } from './table/TableHeader';
import { TableBody } from './table/TableBody';
import { TablePagination } from './table/TablePagination';
import { useTableColumns } from './table/useTableColumns';

interface ResultsTableProps {
  data: Person[];
  visibleRiskColumns: string[];
}

export const ResultsTable = ({ data, visibleRiskColumns }: ResultsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useTableColumns(visibleRiskColumns);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full rounded-md border">
      <ScrollArea className="h-[600px]" type="always">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader table={table} />
              <TableBody table={table} columns={columns} />
            </Table>
          </div>
        </div>
      </ScrollArea>
      <TablePagination table={table} />
    </div>
  );
};