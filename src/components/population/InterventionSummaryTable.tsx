
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RISK_COLUMNS, RISK_COLUMN_FIELD_MAP } from '../table/tableConstants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InterventionSummaryTableProps {
  selectedRiskFactor: string;
  selectedIntervention: string;
  selectedTimeframe: string;
}

interface RiskDistribution {
  range: string;
  pre: number;
  post: number;
}

export function InterventionSummaryTable({ 
  selectedRiskFactor,
  selectedIntervention,
  selectedTimeframe,
}: InterventionSummaryTableProps) {
  // Add state for event cost
  const [eventCost, setEventCost] = useState<number>(2715);

  // Query to get summary data for the selected intervention and risk factor
  const { data: riskDistributionData, isLoading } = useQuery({
    queryKey: ['intervention-summary', selectedRiskFactor, selectedIntervention, selectedTimeframe],
    
    queryFn: async () => {
      const dbRiskFactor = RISK_COLUMN_FIELD_MAP[selectedRiskFactor];
      console.log('Fetching risk distribution data with params (InterventionSummaryTable):', {
        timeframe: selectedTimeframe,
        riskFactor: selectedRiskFactor,
        fact_type: dbRiskFactor,
        intervention: selectedIntervention
      });

      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('*')
        .eq('time_period', parseInt(selectedTimeframe))
        .eq('fact_type', dbRiskFactor)
        .eq('intervention', selectedIntervention);
      
      if (error) {
        console.error('Error fetching intervention summary:', error);
        throw error;
      }

      console.log('risk distribution data (InterventionSummaryTable): ', data); 

      return data || [];
    },
    enabled: !!selectedRiskFactor && !!selectedIntervention && selectedIntervention !== ''
  });

  // Set default intervention to the first one in the sorted list when interventions are loaded
  const [interventions, setInterventions] = useState<string[]>([]);
  const [selectedInterventionState, setSelectedIntervention] = useState<string>('');

  useEffect(() => {
    if (interventions && interventions.length > 0) {
      setSelectedIntervention(interventions[0]);
    }
  }, [interventions]);

  // Handle event cost change
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEventCost(isNaN(value) ? 0 : value);
  };

  // Calculate the expected patients with risk for pre and post intervention
  const calculateExpectedPatients = (riskDistData: RiskDistribution[] | undefined | null) => {
    if (!riskDistData || !Array.isArray(riskDistData) || riskDistData.length === 0) {
      return {
        patientCount: 1000,
        expectedPreCount: "0",
        expectedPostCount: "0",
        difference: "0",
        percentChange: "0",
        totalSavings: "0"
      };
    }
    
    const patientCount = 1000; // Base patient count for calculations
    
    let preTotal = 0;
    let postTotal = 0;

    console.log('risk distribution data: ', riskDistData) ; 
    
    riskDistData.forEach(item => {
      // Convert range to average risk percentage 
      const rangeParts = item.range.split('-');
      if (rangeParts.length === 2) {
        const lowerBound = parseFloat(rangeParts[0]);
        const upperBound = parseFloat(rangeParts[1]);
        const averageRiskPercent = (lowerBound + upperBound) / 2;
        
        // Calculate contribution to expected patients
        const preContribution = (item.pre / 100) * (averageRiskPercent / 100) * patientCount;
        const postContribution = (item.post / 100) * (averageRiskPercent / 100) * patientCount;
        
        preTotal += preContribution;
        postTotal += postContribution;
      }
    });
    
    const difference = postTotal - preTotal;
    const percentChange = preTotal > 0 ? (difference / preTotal) * 100 : 0;
    
    // Use the current eventCost value for calculations
    const totalSavings = -difference * eventCost;
    const preCost = preTotal * eventCost;
    const postCost = postTotal * eventCost;

    return {
      patientCount,
      expectedPreCount: preTotal.toFixed(1),
      expectedPostCount: postTotal.toFixed(1),
      difference: difference.toFixed(1),
      percentChange: percentChange.toFixed(1),
      preCost: preCost.toFixed(0),
      postCost: postCost.toFixed(0),
      totalSavings: totalSavings.toFixed(0)
    };
  };

  console.log('Calculate summary stats...'); 
  const summaryData = calculateExpectedPatients(riskDistributionData);

  if (isLoading || !selectedIntervention) {
    return <div className="text-center py-4">Loading summary data...</div>;
  }

  const differenceIsNegative = parseFloat(summaryData.difference) < 0;
  const formattedDifference = `${differenceIsNegative ? '' : '+'}${summaryData.difference}`;
  const percentChangeDisplay = `(${differenceIsNegative ? '' : '+'}${summaryData.percentChange}%)`;
  const formattedSavings = Math.abs(parseInt(summaryData.totalSavings)).toLocaleString();

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Intervention Results (per 1000 patients)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-start mb-4 gap-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="event-cost" className="whitespace-nowrap min-w-[140px] text-sm">Est. Event Cost ($):</Label>
            <div className="relative">
              <Input 
                id="event-cost"
                type="number"
                min="0"
                step="1"
                value={eventCost}
                onChange={handleCostChange}
                className="w-40"
              />
            </div>
          </div>
        </div>
        
        {/* New prominent banner for estimated savings */}
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <p className="text-lg font-semibold text-gray-800">
            Estimated savings from {selectedIntervention} after {selectedTimeframe} year{selectedTimeframe !== '1' ? 's' : ''}:{' '}
            <span className={differenceIsNegative ? "text-green-700" : "text-red-700"}>
              ${formattedSavings}
            </span>
          </p>
        </div>
        
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3"></TableHead>
              <TableHead className="text-center border font-medium">Predicted {selectedRiskFactor} Events ({selectedTimeframe} year)</TableHead>
              <TableHead className="text-center border font-medium">Cost ({selectedTimeframe} year)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="border font-medium text-gray-600">Pre-intervention</TableCell>
              <TableCell className="border text-center text-gray-600">
                {summaryData.expectedPreCount}
              </TableCell>
              <TableCell className="border text-center text-gray-600">
                ${parseInt(summaryData.preCost).toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border font-medium text-blue-600">Post-intervention</TableCell>
              <TableCell className="border text-center text-blue-600">
                {summaryData.expectedPostCount}
              </TableCell>
              <TableCell className="border text-center text-blue-600">
                ${parseInt(summaryData.postCost).toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border font-medium bg-green-100 text-black">
                Difference after Intervention
              </TableCell>
              <TableCell className={`border text-center font-bold text-black bg-green-100`}>
                {formattedDifference} {percentChangeDisplay}
              </TableCell>
              <TableCell className={`border text-center font-bold text-black bg-green-100`}>
                {differenceIsNegative ? '-' : '+'}${formattedSavings}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
