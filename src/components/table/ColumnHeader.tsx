import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Column } from "@tanstack/react-table";
import { Person } from "@/types/population";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface ColumnHeaderProps {
  column: Column<Person, unknown>;
  title: string;
}

export const ColumnHeader = ({ column, title }: ColumnHeaderProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={column.getIsVisible()}
        onCheckedChange={(value) => column.toggleVisibility(!!value)}
        id={`${column.id}-visibility`}
        aria-label={`Toggle ${title} column visibility`}
      />
      <Label htmlFor={`${column.id}-visibility`} className="text-sm">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent whitespace-nowrap"
        >
          {title}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </Label>
    </div>
  );
};