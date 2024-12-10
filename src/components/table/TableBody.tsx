import { Table, flexRender } from '@tanstack/react-table';
import { TableBody as UITableBody, TableCell, TableRow } from '../ui/table';
import { Person } from '@/types/population';

interface TableBodyProps {
  table: Table<Person>;
  columns: any[];
}

export const TableBody = ({ table, columns }: TableBodyProps) => {
  return (
    <UITableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell, index) => (
              <TableCell
                key={cell.id}
                className={`${index === 0 ? 'sticky left-0 bg-background z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''} whitespace-nowrap`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </UITableBody>
  );
};