import { Table, TableHead, TableHeader as TableHeaderUI, TableRow } from "@/components/ui/table";
import { Column, SortDirection, Table as TableType, flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeaderProps<T> {
  table: TableType<T>;
}

export function TableHeader<T>({ table }: TableHeaderProps<T>) {
  return (
    <TableHeaderUI>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isSorted = header.column.getIsSorted();
            
            // Function to handle sort toggle with descending first
            const handleSortClick = () => {
              if (!header.column.getCanSort()) return;
              
              const currentDirection = header.column.getIsSorted();
              if (!currentDirection) {
                header.column.toggleSorting(true); // true for descending first
              } else {
                header.column.toggleSorting(currentDirection === "desc");
              }
            };

            return (
              <TableHead
                key={header.id}
                onClick={handleSortClick}
                className={cn(
                  header.column.getCanSort() && "cursor-pointer select-none",
                )}
              >
                <div className="flex items-center gap-1">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getCanSort() && (
                    <div className="flex flex-col ml-1">
                      <ArrowUp 
                        className={cn(
                          "h-3 w-3 -mb-1",
                          isSorted === "asc" ? "text-foreground" : "text-muted-foreground/30"
                        )}
                      />
                      <ArrowDown 
                        className={cn(
                          "h-3 w-3",
                          isSorted === "desc" ? "text-foreground" : "text-muted-foreground/30"
                        )}
                      />
                    </div>
                  )}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeaderUI>
  );
}