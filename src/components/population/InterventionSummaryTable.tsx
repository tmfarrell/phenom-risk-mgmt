
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

interface InterventionSummaryTableProps {
  selectedRiskFactor: string;
  selectedIntervention: string;
  selectedTimeframe: string;
}

export function InterventionSummaryTable({ 
  selectedRiskFactor,
  selectedIntervention,
  selectedTimeframe,
}: InterventionSummaryTableProps) {
  // Query to get summary data for the selected intervention and risk factor
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['intervention-summary', selectedRiskFactor, selectedIntervention, selectedTimeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('*')
        .eq('time_period', parseInt(selectedTimeframe))
        .eq('fact_type', selectedRiskFactor)
        .eq('intervention', selectedIntervention);
      
      if (error) {
        console.error('Error fetching intervention summary:', error);
        throw error;
      }

      // Calculate the totals for pre and post intervention
      const totalPre = data.reduce((sum, item) => sum + (item.pre || 0), 0);
      const totalPost = data.reduce((sum, item) => sum + (item.post || 0), 0);
      const patientCount = 200; // Default patient count
      
      const expectedPreCount = (totalPre / 100) * patientCount;
      const expectedPostCount = (totalPost / 100) * patientCount;
      const difference = expectedPostCount - expectedPreCount;
      const percentChange = (difference / expectedPreCount) * 100;
      
      // Estimated cost and savings calculations
      const costPerEvent = 2715; // Default cost per event in dollars
      const totalSavings = -difference * costPerEvent;

      return {
        patientCount,
        expectedPreCount: expectedPreCount.toFixed(1),
        expectedPostCount: expectedPostCount.toFixed(1),
        difference: difference.toFixed(1),
        percentChange: percentChange.toFixed(1),
        costPerEvent,
        totalSavings: totalSavings.toFixed(0)
      };
    },
    enabled: !!selectedRiskFactor && !!selectedIntervention
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading summary data...</div>;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Intervention Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="border">N</TableHead>
              <TableHead className="text-center border text-gray-600">
                Expected # of patients with {selectedRiskFactor} Visit
                <br />(Pre Intervention)
              </TableHead>
              <TableHead className="text-center border text-blue-600">
                Expected # of patients with {selectedRiskFactor} Visit
                <br />(Post Intervention)
              </TableHead>
              <TableHead rowSpan={2} className="text-center border">
                Difference after<br />Intervention
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="border text-center font-medium">
                {summaryData?.patientCount}
              </TableCell>
              <TableCell className="border text-center text-gray-600">
                {summaryData?.expectedPreCount}
              </TableCell>
              <TableCell className="border text-center text-blue-600">
                {summaryData?.expectedPostCount}
              </TableCell>
              <TableCell className="border text-center">
                {summaryData?.difference} ({summaryData?.percentChange}%)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">ROI</h3>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center border">
                  Estimated Cost of Event
                </TableHead>
                <TableHead className="text-center border">
                  Estimated Savings<br />(per thousand patients)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="border text-center">
                  ${summaryData?.costPerEvent.toLocaleString()}
                </TableCell>
                <TableCell className="border text-center">
                  ${(parseFloat(summaryData?.totalSavings || '0') / summaryData?.patientCount * 1000).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
