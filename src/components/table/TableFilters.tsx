import { Table } from '@tanstack/react-table';
import { Input } from '../ui/input';
import { Person } from '@/types/population';

interface TableFiltersProps {
  table: Table<Person>;
}

export const TableFilters = ({ table }: TableFiltersProps) => {
  return (
    <div className="flex items-center py-4 px-4">
      <Input
        placeholder="Filter names..."
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <Input
        placeholder="Filter MRN..."
        value={(table.getColumn('mrn')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('mrn')?.setFilterValue(event.target.value)
        }
        className="max-w-sm ml-4"
      />
    </div>
  );
};
