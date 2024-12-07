import { Table, flexRender } from '@tanstack/react-table';
import { TableHead, TableHeader as UITableHeader, TableRow } from '../ui/table';
import { Person } from '@/types/population';

interface TableHeaderProps {
  table: Table<Person>;
}

export const TableHeader = ({ table }: TableHeaderProps) => {
  return (
    <UITableHeader>
      <TableRow className="bg-blue-50">
        {table.getHeaderGroups().map((headerGroup) => (
          headerGroup.headers.map((header, index) => (
            <TableHead
              key={header.id}
              className={index === 0 ? 'sticky left-0 bg-blue-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          ))
        ))}
      </TableRow>
    </UITableHeader>
  );
};