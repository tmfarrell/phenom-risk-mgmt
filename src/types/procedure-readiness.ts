export interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  riskScore: number;
  absoluteProbability: number;
  relativeRate: number;
}

export interface Procedure {
  id: string;
  name: string;
  category: string;
  baseRate: number;
  averageCost: number;
}

export interface RiskDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface AnalysisSummary {
  totalMembers: number;
  atRiskMembers: number;
  highRiskMembers: number;
  mediumRiskMembers: number;
  lowRiskMembers: number;
  averageRiskScore: number;
  estimatedProcedures: number;
  totalEstimatedCost: number;
}
