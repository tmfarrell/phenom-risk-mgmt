import { Button } from '../ui/button';
import { Table } from '@tanstack/react-table';
import { Person } from '@/types/population';

interface TablePaginationProps {
  table: Table<Person>;
}

export const TablePagination = ({ table }: TablePaginationProps) => {
  return (
    <div className="flex items-center justify-between space-x-2 p-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} total rows
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};