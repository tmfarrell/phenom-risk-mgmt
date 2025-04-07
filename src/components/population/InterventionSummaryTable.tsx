
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

  // Calculate the expected patients with risk for pre and post intervention
  const calculateExpectedPatients = (riskDistData: RiskDistribution[] | undefined | null) => {
    if (!riskDistData || !Array.isArray(riskDistData) || riskDistData.length === 0) {
      return {
        patientCount: 1000,
        expectedPreCount: "0",
        expectedPostCount: "0",
        difference: "0",
        percentChange: "0",
        costPerEvent: 2715,
        totalSavings: "0"
      };
    }
    
    const patientCount = 1000; // Base patient count for calculations
    
    let preTotal = 0;
    let postTotal = 0;

    console.log('risk distribution data: ', riskDistData) ; 
    
    riskDistData.forEach(item => {
      // Convert range to average risk percentage 
      // For example: "0-2" becomes 1%, "3-5" becomes 4%, etc.
      const rangeParts = item.range.split('-');
      if (rangeParts.length === 2) {
        const lowerBound = parseFloat(rangeParts[0]);
        const upperBound = parseFloat(rangeParts[1]);
        const averageRiskPercent = (lowerBound + upperBound) / 2;
        
        // Calculate contribution to expected patients
        // percentage of population in this risk category * average risk percentage * total patient count
        const preContribution = (item.pre / 100) * (averageRiskPercent / 100) * patientCount;
        const postContribution = (item.post / 100) * (averageRiskPercent / 100) * patientCount;
        
        preTotal += preContribution;
        postTotal += postContribution;
      }
    });
    
    const difference = postTotal - preTotal;
    const percentChange = preTotal > 0 ? (difference / preTotal) * 100 : 0;
    
    // Estimated cost and savings calculations
    const costPerEvent = 2715; // Default cost per event in dollars
    const totalSavings = -difference * costPerEvent;

    return {
      patientCount,
      expectedPreCount: preTotal.toFixed(1),
      expectedPostCount: postTotal.toFixed(1),
      difference: difference.toFixed(1),
      percentChange: percentChange.toFixed(1),
      costPerEvent,
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

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Intervention Results (per 1000 patients)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3"></TableHead>
              <TableHead className="text-center border font-medium">Events</TableHead>
              <TableHead className="text-center border font-medium">ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="border font-medium text-gray-600">Pre-intervention</TableCell>
              <TableCell className="border text-center text-gray-600">
                {summaryData.expectedPreCount}
              </TableCell>
              <TableCell className="border text-center font-medium">
                Est. Event Cost
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border font-medium text-blue-600">Post-intervention</TableCell>
              <TableCell className="border text-center text-blue-600">
                {summaryData.expectedPostCount}
              </TableCell>
              <TableCell className="border text-center">
                ${summaryData.costPerEvent.toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border font-medium">
                Difference after Intervention
              </TableCell>
              <TableCell className={`border text-center ${differenceIsNegative ? 'text-green-600' : 'text-red-600'}`}>
                {formattedDifference} {percentChangeDisplay}
              </TableCell>
              <TableCell className="border text-center font-medium">
                Est. Savings
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border"></TableCell>
              <TableCell className="border"></TableCell>
              <TableCell className="border text-center text-green-600 font-medium">
                ${parseInt(summaryData.totalSavings).toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
