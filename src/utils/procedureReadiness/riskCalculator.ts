import { Member, Procedure, RiskDistribution, AnalysisSummary } from '@/types/procedure-readiness';

export function calculateMemberRisk(
  memberId: string,
  firstName: string,
  lastName: string,
  age: number,
  gender: 'M' | 'F' | 'O',
  procedure: Procedure
): Member {
  let ageFactor: number;
  if (age >= 82) {
    ageFactor = 7.5 + (age - 82) * 0.5;
  } else if (age >= 78) {
    ageFactor = 6.5 + (age - 78) * 0.25;
  } else if (age >= 72) {
    ageFactor = 5.5 + (age - 72) * 0.17;
  } else if (age >= 68) {
    ageFactor = 4.5 + (age - 68) * 0.25;
  } else if (age >= 62) {
    ageFactor = 3.5 + (age - 62) * 0.17;
  } else if (age >= 56) {
    ageFactor = 2.7 + (age - 56) * 0.13;
  } else if (age >= 50) {
    ageFactor = 2.0 + (age - 50) * 0.12;
  } else if (age >= 44) {
    ageFactor = 1.3 + (age - 44) * 0.12;
  } else if (age >= 38) {
    ageFactor = 0.6 + (age - 38) * 0.12;
  } else {
    ageFactor = 0.15 + (age - 25) * 0.035;
  }
  
  const genderFactor = procedure.category === 'Lower Extremity' && gender === 'F' ? 1.05 : 1.0;
  const randomFactor = 0.9 + Math.random() * 0.2;
  
  const rawScore = procedure.baseRate * ageFactor * genderFactor * randomFactor * 1000;
  const riskScore = Math.min(Math.max(rawScore, 0), 100);
  
  const absoluteProbability = Math.min(procedure.baseRate * ageFactor * genderFactor * randomFactor * 100, 35);
  const relativeRate = ageFactor * genderFactor * randomFactor;

  return {
    id: `${memberId}-${procedure.id}`,
    memberId,
    firstName,
    lastName,
    age,
    gender,
    riskScore: Math.round(riskScore * 10) / 10,
    absoluteProbability: Math.round(absoluteProbability * 100) / 100,
    relativeRate: Math.round(relativeRate * 100) / 100,
  };
}

export function calculateRiskDistribution(members: Member[]): RiskDistribution[] {
  const ranges = [
    { min: 0, max: 10, label: '0-10%' },
    { min: 10, max: 20, label: '10-20%' },
    { min: 20, max: 30, label: '20-30%' },
    { min: 30, max: 40, label: '30-40%' },
    { min: 40, max: 50, label: '40-50%' },
    { min: 50, max: 60, label: '50-60%' },
    { min: 60, max: 70, label: '60-70%' },
    { min: 70, max: 80, label: '70-80%' },
    { min: 80, max: 90, label: '80-90%' },
    { min: 90, max: 100, label: '90-100%' },
  ];

  return ranges.map(range => {
    const count = members.filter(
      m => m.riskScore >= range.min && m.riskScore < range.max
    ).length;
    return {
      range: range.label,
      count,
      percentage: members.length > 0 ? Math.round((count / members.length) * 100 * 10) / 10 : 0,
    };
  });
}

export function calculateAnalysisSummary(
  members: Member[],
  procedureCost: number
): AnalysisSummary {
  const highRiskMembers = members.filter(m => m.riskScore >= 60).length;
  const mediumRiskMembers = members.filter(m => m.riskScore >= 30 && m.riskScore < 60).length;
  const lowRiskMembers = members.filter(m => m.riskScore < 30).length;
  const atRiskMembers = members.filter(m => m.riskScore >= 20).length;
  
  const averageRiskScore = members.length > 0
    ? members.reduce((sum, m) => sum + m.riskScore, 0) / members.length
    : 0;

  const estimatedProcedures = members.reduce(
    (sum, m) => sum + (m.absoluteProbability / 100),
    0
  );

  const totalEstimatedCost = estimatedProcedures * procedureCost;

  return {
    totalMembers: members.length,
    atRiskMembers,
    highRiskMembers,
    mediumRiskMembers,
    lowRiskMembers,
    averageRiskScore: Math.round(averageRiskScore * 10) / 10,
    estimatedProcedures: Math.round(estimatedProcedures * 10) / 10,
    totalEstimatedCost: Math.round(totalEstimatedCost),
  };
}

export function exportMembersToCSV(members: Member[], procedureName: string): string {
  const headers = [
    'Member ID',
    'First Name',
    'Last Name',
    'Age',
    'Gender',
    'Risk Score',
    'Absolute Probability (%)',
    'Relative Rate',
  ];

  const rows = members.map(m => [
    m.memberId,
    m.firstName,
    m.lastName,
    m.age.toString(),
    m.gender,
    m.riskScore.toString(),
    m.absoluteProbability.toString(),
    m.relativeRate.toString(),
  ]);

  const csvContent = [
    `# Risk Analysis for ${procedureName}`,
    `# Generated: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}
