import { Check, ChevronDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { procedures } from '@/data/procedures';
import { Procedure } from '@/types/procedure-readiness';
import { useState } from 'react';

interface ProcedureSelectorProps {
  value: Procedure | null;
  onChange: (procedure: Procedure) => void;
}

export function ProcedureSelector({ value, onChange }: ProcedureSelectorProps) {
  const [open, setOpen] = useState(false);

  const groupedProcedures = procedures.reduce((acc, proc) => {
    if (!acc[proc.category]) {
      acc[proc.category] = [];
    }
    acc[proc.category].push(proc);
    return acc;
  }, {} as Record<string, Procedure[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3 px-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            {value ? (
              <div className="text-left">
                <p className="font-medium">{value.name}</p>
                <p className="text-xs text-muted-foreground">{value.category}</p>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a procedure...</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search procedures..." />
          <CommandList>
            <CommandEmpty>No procedure found.</CommandEmpty>
            {Object.entries(groupedProcedures).map(([category, procs]) => (
              <CommandGroup key={category} heading={category}>
                {procs.map((proc) => (
                  <CommandItem
                    key={proc.id}
                    value={proc.name}
                    onSelect={() => {
                      onChange(proc);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 py-2"
                  >
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value?.id === proc.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{proc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Base rate: {(proc.baseRate * 100).toFixed(2)}% | Avg cost: ${proc.averageCost.toLocaleString()}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
