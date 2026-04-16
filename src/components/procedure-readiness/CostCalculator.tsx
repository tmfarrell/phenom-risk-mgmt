import { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, ShieldCheck, Banknote, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { Member } from '@/types/procedure-readiness';

interface CostCalculatorProps {
  defaultCost: number;
  members: Member[];
  procedureCost: number;
  onCostChange: (cost: number) => void;
}

const THRESHOLD_PRESETS = [
  { label: 'High Risk (≥60)', value: 60 },
  { label: 'Medium+ (≥30)', value: 30 },
  { label: 'At-Risk (≥20)', value: 20 },
];

function formatDollar(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export function CostCalculator({
  defaultCost,
  members,
  procedureCost,
  onCostChange,
}: CostCalculatorProps) {
  const [cost, setCost] = useState(defaultCost);
  const [screeningCost, setScreeningCost] = useState(250);
  const [riskThreshold, setRiskThreshold] = useState(60);

  useEffect(() => {
    setCost(defaultCost);
  }, [defaultCost]);

  const handleCostChange = (value: number) => {
    setCost(value);
    onCostChange(value);
  };

  // Derived screening metrics for the selected threshold
  const screeningMetrics = useMemo(() => {
    const patientsToScreen = members.filter(m => m.riskScore >= riskThreshold);
    const totalScreeningCost = patientsToScreen.length * screeningCost;
    const proceduresAvoided = patientsToScreen.reduce(
      (s, m) => s + m.absoluteProbability / 100,
      0
    );
    const costAvoidance = proceduresAvoided * procedureCost;
    const netSavings = costAvoidance - totalScreeningCost;
    return {
      patientsScreened: patientsToScreen.length,
      totalScreeningCost,
      proceduresAvoided,
      costAvoidance,
      netSavings,
    };
  }, [members, riskThreshold, screeningCost, procedureCost]);

  // Sensitivity curve: sweep threshold 0–100 in 5-point steps
  const sensitivityData = useMemo(() => {
    const points: { threshold: number; patientsScreened: number; netSavings: number }[] = [];
    for (let t = 0; t <= 100; t += 5) {
      const screened = members.filter(m => m.riskScore >= t);
      const screeningTotal = screened.length * screeningCost;
      const avoided = screened.reduce((s, m) => s + m.absoluteProbability / 100, 0);
      const avoidance = avoided * procedureCost;
      points.push({
        threshold: t,
        patientsScreened: screened.length,
        netSavings: avoidance - screeningTotal,
      });
    }
    return points;
  }, [members, screeningCost, procedureCost]);

  const optimalPoint = useMemo(
    () =>
      sensitivityData.reduce(
        (best, pt) => (pt.netSavings > best.netSavings ? pt : best),
        sensitivityData[0] ?? { threshold: 0, netSavings: 0, patientsScreened: 0 }
      ),
    [sensitivityData]
  );

  const netSavingsPositive = screeningMetrics.netSavings >= 0;

  return (
    <div className="space-y-8">
      {/* Inputs row: all three controls in one grid */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Procedure Cost */}
        <div className="space-y-3">
          <Label htmlFor="procedure-cost" className="text-sm font-medium">
            Procedure Cost
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

        {/* Cost per Screening */}
        <div className="space-y-3">
          <Label htmlFor="screening-cost" className="text-sm font-medium">
            Cost per Screening
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="screening-cost"
              type="number"
              value={screeningCost}
              onChange={(e) => setScreeningCost(parseInt(e.target.value) || 0)}
              className="pl-9 text-lg font-semibold"
            />
          </div>
          <Slider
            value={[screeningCost]}
            onValueChange={(values) => setScreeningCost(values[0])}
            min={0}
            max={5000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$5,000</span>
          </div>
        </div>

        {/* Risk Threshold */}
        <div className="space-y-3">
          <Label htmlFor="risk-threshold" className="text-sm font-medium">
            Screening Risk Threshold
          </Label>
          <Input
            id="risk-threshold"
            type="number"
            value={riskThreshold}
            onChange={(e) => {
              const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              setRiskThreshold(v);
            }}
            className="text-lg font-semibold"
          />
          <Slider
            value={[riskThreshold]}
            onValueChange={(values) => setRiskThreshold(values[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 (all)</span>
            <span className="tabular-nums">{screeningMetrics.patientsScreened} of {members.length} members</span>
            <span>100 (none)</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {THRESHOLD_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={riskThreshold === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRiskThreshold(preset.value)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 3: Impact Summary Cards */}
      <div>
        <h3 className="text-base font-semibold mb-4">Screening Impact Summary</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg border bg-muted/30 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <p className="text-xs font-medium">Patients Screened</p>
            </div>
            <p className="text-2xl font-bold">
              {screeningMetrics.patientsScreened.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {members.length > 0
                ? ((screeningMetrics.patientsScreened / members.length) * 100).toFixed(1)
                : '0'}
              % of cohort
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="w-4 h-4" />
              <p className="text-xs font-medium">Total Screening Cost</p>
            </div>
            <p className="text-2xl font-bold">
              {formatDollar(screeningMetrics.totalScreeningCost)}
            </p>
            <p className="text-xs text-muted-foreground">
              {screeningMetrics.patientsScreened.toLocaleString()} × {formatDollar(screeningCost)}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-xs font-medium">Procedures Avoided</p>
            </div>
            <p className="text-2xl font-bold">
              {screeningMetrics.proceduresAvoided.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDollar(screeningMetrics.costAvoidance)} in cost avoidance
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calculator className="w-4 h-4" />
              <p className="text-xs font-medium">Cost Avoided</p>
            </div>
            <p className="text-2xl font-bold">
              {formatDollar(screeningMetrics.costAvoidance)}
            </p>
            <p className="text-xs text-muted-foreground">
              {screeningMetrics.proceduresAvoided.toFixed(1)} procedures × {formatDollar(cost)}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border space-y-1 ${
              netSavingsPositive
                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                netSavingsPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <p className="text-xs font-medium">Net Savings</p>
            </div>
            <p
              className={`text-2xl font-bold ${
                netSavingsPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              {netSavingsPositive ? '' : '-'}
              {formatDollar(Math.abs(screeningMetrics.netSavings))}
            </p>
            <p className="text-xs text-muted-foreground">
              vs. no screening intervention
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 4: Sensitivity Chart */}
      <div>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold">Net Savings vs. Screening Threshold</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Adjust screening cost or threshold to find the optimal screening approach.
              {optimalPoint && (
                <span className="ml-1">
                  Optimal threshold: <span className="font-medium">≥{optimalPoint.threshold}</span>{' '}
                  ({formatDollar(optimalPoint.netSavings)} net savings).
                </span>
              )}
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm border rounded-lg bg-muted/20">
            Upload a member cohort to see the sensitivity analysis.
          </div>
        ) : (
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sensitivityData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis
                  dataKey="threshold"
                  tick={{ fontSize: 12, fill: 'hsl(210, 15%, 45%)' }}
                  label={{
                    value: 'Risk Threshold',
                    position: 'insideBottom',
                    offset: -2,
                    style: { fontSize: 12, fill: 'hsl(210, 15%, 45%)', textAnchor: 'middle' },
                  }}
                  height={40}
                />
                <YAxis
                  width={72}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: 'hsl(210, 15%, 45%)' }}
                  label={{
                    value: 'Net Savings ($)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -4,
                    dy: 10,
                    style: { fontSize: 12, fill: 'hsl(210, 15%, 45%)', textAnchor: 'middle' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(210, 20%, 90%)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'netSavings') return [formatDollar(value), 'Net Savings'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const pt = sensitivityData.find(d => d.threshold === label);
                    return `Threshold ≥${label} — ${pt?.patientsScreened ?? 0} patients screened`;
                  }}
                />
                {/* Zero-line reference */}
                <ReferenceLine y={0} stroke="hsl(210, 15%, 65%)" strokeDasharray="4 3" />
                {/* Optimal threshold */}
                {optimalPoint && (
                  <ReferenceLine
                    x={optimalPoint.threshold}
                    stroke="hsl(142, 71%, 45%)"
                    strokeDasharray="5 3"
                    label={{
                      value: `Optimal ≥${optimalPoint.threshold}`,
                      position: 'insideBottomLeft',
                      offset: 4,
                      style: { fontSize: 11, fill: 'hsl(142, 71%, 35%)' },
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="netSavings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Selected threshold dot */}
                {sensitivityData.find(d => d.threshold === riskThreshold) && (
                  <ReferenceDot
                    x={riskThreshold}
                    y={screeningMetrics.netSavings}
                    r={6}
                    fill="hsl(var(--primary))"
                    stroke="white"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
