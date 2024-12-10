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
  RowSelectionState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { TableHeader } from './table/TableHeader';
import { TableBody } from './table/TableBody';
import { TablePagination } from './table/TablePagination';
import { useTableColumns } from './table/useTableColumns';
import { TableControls } from './table/TableControls';
import { useNavigate } from 'react-router-dom';

interface ResultsTableProps {
  data: Person[];
  visibleRiskColumns: string[];
}

export const ResultsTable = ({ data, visibleRiskColumns }: ResultsTableProps) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1');
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');

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
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  const handleViewPanel = () => {
    console.log('Selected rows:', rowSelection);
    const selectedPatients = data.filter((_, index) => rowSelection[index]);
    navigate('/panel', { state: { selectedPatients } });
  };

  return (
    <div className="w-full rounded-md border">
      <TableControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedRiskColumns={visibleRiskColumns}
        onRiskColumnsChange={() => {}}
        timeframes={[1, 5]}
        selectedRiskType={selectedRiskType}
        onRiskTypeChange={setSelectedRiskType}
        selectedRowCount={selectedRowCount}
        onViewPanel={handleViewPanel}
      />
      <ScrollArea className="h-[600px]" type="always">
        <div className="relative">
          <Table>
            <TableHeader table={table} />
            <TableBody table={table} columns={columns} />
          </Table>
        </div>
      </ScrollArea>
      <TablePagination table={table} />
    </div>
  );
};