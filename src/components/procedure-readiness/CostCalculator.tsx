import { useState, useEffect } from 'react';
import { DollarSign, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface CostCalculatorProps {
  defaultCost: number;
  estimatedProcedures: number;
  onCostChange: (cost: number) => void;
}

export function CostCalculator({ defaultCost, estimatedProcedures, onCostChange }: CostCalculatorProps) {
  const [cost, setCost] = useState(defaultCost);

  useEffect(() => {
    setCost(defaultCost);
  }, [defaultCost]);

  const handleCostChange = (value: number) => {
    setCost(value);
    onCostChange(value);
  };

  const totalCost = estimatedProcedures * cost;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <Label htmlFor="procedure-cost" className="text-sm font-medium">
          Procedure Cost ($)
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="procedure-cost"
            type="number"
            value={cost}
            onChange={(e) => handleCostChange(parseInt(e.target.value) || 0)}
            className="pl-9 text-lg font-semibold"
          />
        </div>
        <Slider
          value={[cost]}
          onValueChange={(values) => handleCostChange(values[0])}
          min={1000}
          max={150000}
          step={1000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$1,000</span>
          <span>$150,000</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-accent border border-primary/20 h-full flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estimated Total Cost</p>
            <p className="text-xs text-muted-foreground">
              {estimatedProcedures.toFixed(1)} procedures × ${cost.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="text-3xl font-bold text-primary">
          ${totalCost.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
