
import { Person } from '@/types/population';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';
import { usePatientData } from '@/hooks/usePatientData';
import { RiskTableRow } from './RiskTableRow';
import { RiskSummary } from '@/hooks/useRiskSummaries';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect, useMemo, useState } from 'react';

interface RiskTableProps {
  selectedRiskType: 'relative' | 'absolute';
  patientRisks: Person[];
  riskSummaries?: RiskSummary[];
  rowConfigs: Array<{ outcome: string; timeframe: string }>;
  onRemoveRow: (index: number) => void;
  onAddRow: (outcome: string, timeframe: string) => void;
  availableOutcomes: string[];
  timeframes: number[];
  outcomeTimeframeMap: Record<string, number[]>;
  outcomeModelMap: Record<string, Array<{id: string, timeframe: number}>>;
}

export const RiskTable = ({ 
  selectedRiskType, 
  patientRisks, 
  riskSummaries = [], 
  rowConfigs, 
  onRemoveRow,
  onAddRow,
  availableOutcomes,
  timeframes,
  outcomeTimeframeMap,
  outcomeModelMap
}: RiskTableProps) => {
  const { data: patientData } = usePatientData();
  const [newOutcome, setNewOutcome] = useState<string>(availableOutcomes[0] || '');
  const [newTimeframe, setNewTimeframe] = useState<string>((timeframes[0]?.toString()) || '1');

  const newOutcomeTimeframes = useMemo(() => {
    const tf = outcomeTimeframeMap[newOutcome];
    return (tf && tf.length > 0 ? tf : timeframes).map(t => t.toString());
  }, [newOutcome, outcomeTimeframeMap, timeframes]);

  // Ensure newTimeframe is valid when outcome changes
  useEffect(() => {
    if (!newOutcomeTimeframes.includes(newTimeframe)) {
      setNewTimeframe(newOutcomeTimeframes[0] || '1');
    }
  }, [newOutcomeTimeframes, newTimeframe]);

  // Demo mapping: deterministically pick a random source field per row to back the displayed outcome label
  const sourceFields = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'Mortality'];
  const patientId = patientRisks[0]?.patient_id || 0;
  const hashString = (input: string) => {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = (h << 5) - h + input.charCodeAt(i);
      h |= 0; // Convert to 32bit integer
    }
    return Math.abs(h);
  };
  const rowKeyToSourceField = useMemo(() => {
    const map: Record<string, string> = {};
    rowConfigs.forEach(cfg => {
      const key = `${patientId}-${cfg.outcome}-${cfg.timeframe}`;
      const idx = hashString(key) % sourceFields.length;
      map[`${cfg.outcome}-${cfg.timeframe}`] = sourceFields[idx];
    });
    return map;
  }, [patientId, rowConfigs]);

  // Set y-axis domain based on risk type
  const yAxisDomain: [number, number] = selectedRiskType === 'relative' 
    ? [0, 7.5]  // Updated domain for relative risk
    : [0, 100]; // Domain for absolute risk

  const calculateAverageRisk = (riskFactor: string, timeframe: number | undefined) => {
    if (!patientData || !timeframe) return 'N/A';
    
    const relevantRisks = patientData.filter(
      p => p.risk_type === 'absolute' && 
      p.prediction_timeframe_yrs === timeframe
    );

    if (relevantRisks.length === 0) return 'N/A';

    const sum = relevantRisks.reduce((acc, curr) => {
      const value = curr[riskFactor as keyof Person];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    const avg = sum / relevantRisks.length;
    return `${Math.round(avg)}%`;
  };

  // Map our risk factor names to the database fact_type values (fallback mapping)
  const riskFactorToFactType: { [key: string]: string } = {
    'ED': 'EMERGENCY_VISIT',
    'Hospitalization': 'HOSPITALIZATION',
    'Fall': 'FALL',
    'Stroke': 'STROKE',
    'MI': 'INFARCTION',
    'HS': 'INFARCTION',
    'Mortality': 'DEATH'
  };

  // Get summary for a specific risk factor
  const getSummary = (riskFactor: string) => {
    const factType = riskFactorToFactType[riskFactor];
    
    if (!factType) return null;
    
    const summary = riskSummaries.find(s => 
      s.fact_type === factType
    );
    
    console.log(`Looking for summary: factor=${riskFactor}, fact_type=${factType}, risk_type=${selectedRiskType}`);
    console.log('Found summary:', summary);
    
    return summary?.summary || null;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Outcome</TableHead>
            <TableHead>Time Period</TableHead>
            <TableHead>Risk Trend</TableHead>
            <TableHead>Risk Value</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowConfigs.map((cfg, index) => {
            const timeframeNum = parseInt(cfg.timeframe);
            const risksForRow = patientRisks.filter(r => r.risk_type === selectedRiskType && r.prediction_timeframe_yrs === timeframeNum);
            const currentRisk = [...risksForRow].sort((a, b) => {
              const da = a.recorded_date ? new Date(a.recorded_date).getTime() : 0;
              const db = b.recorded_date ? new Date(b.recorded_date).getTime() : 0;
              return db - da;
            })[0];
            const valueKey = rowKeyToSourceField[`${cfg.outcome}-${cfg.timeframe}`] || cfg.outcome;
            // Find model id for this outcome and timeframe (first match)
            const modelId = (outcomeModelMap[cfg.outcome] || []).find(m => m.timeframe === timeframeNum)?.id;
            return (
              <RiskTableRow
                key={`${cfg.outcome}-${cfg.timeframe}-${index}`}
                risk={cfg.outcome}
                valueKey={valueKey}
                timeframe={cfg.timeframe}
                currentRisks={currentRisk}
                selectedRiskType={selectedRiskType}
                allRisks={risksForRow}
                averageRisk={calculateAverageRisk(valueKey, timeframeNum)}
                yAxisDomain={yAxisDomain}
                summary={getSummary(cfg.outcome)}
                onRemove={() => onRemoveRow(index)}
                modelId={modelId}
              />
            );
          })}
          <TableRow>
            <TableHead colSpan={5} className="bg-gray-50">
              <div className="flex items-center gap-3 mt-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Add outcome</span>
                  <Select value={newOutcome} onValueChange={(v) => setNewOutcome(v)}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOutcomes.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Timeframe</span>
                  <Select value={newTimeframe} onValueChange={(v) => setNewTimeframe(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      {newOutcomeTimeframes.map(tf => (
                        <SelectItem key={tf} value={tf}>{tf} year{tf !== '1' ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => onAddRow(newOutcome, newTimeframe)} disabled={!newOutcome || !newTimeframe}>
                  Add
                </Button>
              </div>
            </TableHead>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
