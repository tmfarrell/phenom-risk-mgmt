import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/procedure-readiness/FileUpload';
import { ProcedureSelector } from '@/components/procedure-readiness/ProcedureSelector';
import { RiskDistributionChart } from '@/components/procedure-readiness/RiskDistributionChart';
import { StatCard } from '@/components/procedure-readiness/StatCard';
import { CostCalculator } from '@/components/procedure-readiness/CostCalculator';
import { MemberTable } from '@/components/procedure-readiness/MemberTable';
import { Procedure } from '@/types/procedure-readiness';
import {
  calculateMemberRisk,
  calculateRiskDistribution,
  calculateAnalysisSummary,
} from '@/utils/procedureReadiness/riskCalculator';

interface ParsedMember {
  memberId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
}

const ProcedureReadiness = () => {
  const [rawMembers, setRawMembers] = useState<ParsedMember[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [procedureCost, setProcedureCost] = useState(35000);

  const analyzedMembers = useMemo(() => {
    if (!selectedProcedure || rawMembers.length === 0) return [];
    return rawMembers.map((m) =>
      calculateMemberRisk(m.memberId, m.firstName, m.lastName, m.age, m.gender, selectedProcedure)
    );
  }, [rawMembers, selectedProcedure]);

  const riskDistribution = useMemo(() => {
    return calculateRiskDistribution(analyzedMembers);
  }, [analyzedMembers]);

  const summary = useMemo(() => {
    return calculateAnalysisSummary(analyzedMembers, procedureCost);
  }, [analyzedMembers, procedureCost]);

  const handleMembersUpload = (members: ParsedMember[]) => {
    setRawMembers(members);
  };

  const handleProcedureChange = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setProcedureCost(procedure.averageCost);
  };

  const isAnalysisReady = rawMembers.length > 0 && selectedProcedure;

  return (
    <div className="min-h-screen w-full">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">Procedure Risk Dashboard</h1>
        </div>
        <Tabs defaultValue="analysis" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analysis">
              Readiness Analysis
            </TabsTrigger>
            <TabsTrigger value="members" disabled={!isAnalysisReady}>
              Member List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-8 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Upload Member Cohort</CardTitle>
                  <CardDescription>
                    Upload a CSV file with your member population data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onUpload={handleMembersUpload} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Select Procedure</CardTitle>
                  <CardDescription>
                    Choose the surgical procedure to analyze readiness for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProcedureSelector
                    value={selectedProcedure}
                    onChange={handleProcedureChange}
                  />
                  {selectedProcedure && (
                    <div className="p-4 rounded-lg bg-accent/50 border border-accent-foreground/10">
                      <p className="text-sm">
                        <span className="font-medium">Selected:</span> {selectedProcedure.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Population base rate: {(selectedProcedure.baseRate * 100).toFixed(2)}% per year
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {isAnalysisReady && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Members"
                    value={summary.totalMembers.toLocaleString()}
                    subtitle="In uploaded cohort"
                    variant="primary"
                  />
                  <StatCard
                    title="High Risk Members"
                    value={summary.highRiskMembers.toLocaleString()}
                    subtitle={`${((summary.highRiskMembers / summary.totalMembers) * 100).toFixed(1)}% of cohort`}
                    variant="destructive"
                  />
                  <StatCard
                    title="Estimated Procedures"
                    value={summary.estimatedProcedures.toFixed(1)}
                    subtitle="In next 12 months"
                    variant="warning"
                  />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Risk Score Distribution</CardTitle>
                      <CardDescription>
                        Number of members in each risk category for {selectedProcedure.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RiskDistributionChart data={riskDistribution} />
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-risk-low" />
                          <span className="text-xs text-muted-foreground">Low Risk (0-30)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-risk-medium" />
                          <span className="text-xs text-muted-foreground">Medium Risk (30-60)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-risk-high" />
                          <span className="text-xs text-muted-foreground">High Risk (60+)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Estimation</CardTitle>
                      <CardDescription>
                        Calculate projected costs based on procedure price
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CostCalculator
                        defaultCost={selectedProcedure.averageCost}
                        estimatedProcedures={summary.estimatedProcedures}
                        onCostChange={setProcedureCost}
                      />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Category Breakdown</CardTitle>
                    <CardDescription>
                      Members segmented by risk level for intervention planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border bg-risk-high/5 border-risk-high/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-risk-high" />
                          <span className="text-sm font-medium">High Risk</span>
                        </div>
                        <p className="text-3xl font-bold text-risk-high">{summary.highRiskMembers}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Risk score 60+ | Immediate intervention recommended
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border bg-risk-medium/5 border-risk-medium/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-risk-medium" />
                          <span className="text-sm font-medium">Medium Risk</span>
                        </div>
                        <p className="text-3xl font-bold text-risk-medium">{summary.mediumRiskMembers}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Risk score 30-60 | Monitor and engage
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border bg-risk-low/5 border-risk-low/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-risk-low" />
                          <span className="text-sm font-medium">Low Risk</span>
                        </div>
                        <p className="text-3xl font-bold text-risk-low">{summary.lowRiskMembers}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Risk score &lt;30 | Standard prevention
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!isAnalysisReady && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Upload a member cohort and select a procedure to view readiness analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="animate-fade-in">
            {isAnalysisReady && (
              <Card>
                <CardHeader>
                  <CardTitle>Member Risk Rankings</CardTitle>
                  <CardDescription>
                    Members ranked by risk score for {selectedProcedure.name}. 
                    Click column headers to sort. Export to CSV for offline analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MemberTable
                    members={analyzedMembers}
                    procedureName={selectedProcedure.name}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProcedureReadiness;
