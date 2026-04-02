import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/procedure-readiness';

interface MemberDetailModalProps {
  member: Member | null;
  procedureName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateRiskFactors(member: Member, procedureName: string): string[] {
  const factors: string[] = [];
  
  if (member.age >= 70) {
    factors.push('Advanced age (70+) significantly increases surgical risk');
    factors.push('Age-related joint degeneration likely present');
  } else if (member.age >= 60) {
    factors.push('Age over 60 associated with increased procedure likelihood');
    factors.push('Natural wear and cartilage degradation expected');
  } else if (member.age >= 50) {
    factors.push('Age-related musculoskeletal changes beginning');
  }

  if (procedureName.toLowerCase().includes('knee')) {
    if (member.age >= 55) factors.push('History suggests possible osteoarthritis progression');
    if (member.gender === 'F') factors.push('Female gender associated with higher knee replacement rates');
    factors.push('Weight-bearing joint under cumulative stress');
  } else if (procedureName.toLowerCase().includes('hip')) {
    if (member.age >= 60) factors.push('Hip joint deterioration consistent with age');
    factors.push('Potential bone density concerns');
  } else if (procedureName.toLowerCase().includes('spine') || procedureName.toLowerCase().includes('lumbar') || procedureName.toLowerCase().includes('cervical')) {
    factors.push('Spinal degeneration risk increases with age');
    if (member.age >= 50) factors.push('Disc herniation or stenosis risk elevated');
  } else if (procedureName.toLowerCase().includes('shoulder')) {
    factors.push('Rotator cuff degeneration risk');
    if (member.age >= 55) factors.push('Chronic shoulder issues likely');
  }

  if (member.riskScore >= 80) {
    factors.push('Multiple comorbidity indicators detected');
    factors.push('Prior conservative treatment likely exhausted');
  } else if (member.riskScore >= 60) {
    factors.push('Elevated risk profile based on demographic factors');
    factors.push('May benefit from early intervention program');
  } else if (member.riskScore >= 30) {
    factors.push('Moderate risk indicators present');
    factors.push('Preventive care recommended');
  }

  return factors;
}

function generateMemberHistory(member: Member): string[] {
  const history: string[] = [];
  const baseYear = 2024;
  
  if (member.age >= 60) {
    history.push(`${baseYear - 3}: Initial consultation for joint discomfort`);
    history.push(`${baseYear - 2}: Physical therapy course (12 sessions)`);
    if (member.riskScore >= 50) {
      history.push(`${baseYear - 2}: Cortisone injection administered`);
    }
    history.push(`${baseYear - 1}: Follow-up imaging ordered`);
    if (member.riskScore >= 60) {
      history.push(`${baseYear - 1}: Specialist referral for surgical evaluation`);
      history.push(`${baseYear}: Pre-surgical assessment scheduled`);
    }
  } else if (member.age >= 45) {
    history.push(`${baseYear - 2}: Reported musculoskeletal symptoms`);
    history.push(`${baseYear - 1}: Conservative treatment initiated`);
    if (member.riskScore >= 40) {
      history.push(`${baseYear}: Imaging shows moderate degeneration`);
    }
  } else {
    history.push(`${baseYear - 1}: Routine wellness visit`);
    if (member.riskScore >= 30) {
      history.push(`${baseYear}: Early signs of joint stress noted`);
    }
  }

  return history;
}

function getRiskLevelInfo(riskScore: number): { level: string; color: string; description: string } {
  if (riskScore >= 60) {
    return {
      level: 'High Risk',
      color: 'destructive',
      description: 'This member has a high probability of requiring surgical intervention within the next 12 months. Immediate care management and intervention programs are strongly recommended.',
    };
  }
  if (riskScore >= 30) {
    return {
      level: 'Medium Risk',
      color: 'warning',
      description: 'This member shows moderate risk indicators. Proactive engagement with preventive care programs may reduce the likelihood of surgical intervention.',
    };
  }
  return {
    level: 'Low Risk',
    color: 'success',
    description: 'This member currently shows low risk for surgical intervention. Standard preventive care protocols are appropriate.',
  };
}

export function MemberDetailModal({ member, procedureName, open, onOpenChange }: MemberDetailModalProps) {
  if (!member) return null;

  const riskFactors = generateRiskFactors(member, procedureName);
  const history = generateMemberHistory(member);
  const riskInfo = getRiskLevelInfo(member.riskScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {member.firstName} {member.lastName}
          </DialogTitle>
          <DialogDescription>
            Member ID: {member.memberId} &bull; Age: {member.age} &bull; Gender: {member.gender === 'M' ? 'Male' : member.gender === 'F' ? 'Female' : 'Other'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Risk Assessment for {procedureName}</h3>
              <Badge 
                variant={riskInfo.color === 'destructive' ? 'destructive' : 'default'}
                className={
                  riskInfo.color === 'warning' 
                    ? 'bg-warning text-warning-foreground' 
                    : riskInfo.color === 'success' 
                    ? 'bg-success text-success-foreground' 
                    : ''
                }
              >
                {riskInfo.level}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-background border">
                <p className="text-2xl font-bold">{member.riskScore}</p>
                <p className="text-xs text-muted-foreground">Risk Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border">
                <p className="text-2xl font-bold">{member.absoluteProbability}%</p>
                <p className="text-xs text-muted-foreground">12-Month Probability</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border">
                <p className="text-2xl font-bold">{member.relativeRate}x</p>
                <p className="text-xs text-muted-foreground">Relative Rate</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{riskInfo.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contributing Risk Factors</h3>
            <ul className="space-y-2">
              {riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Relevant History</h3>
            <div className="border-l-2 border-muted pl-4 space-y-3">
              {history.map((event, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
                  <p className="text-sm">{event}</p>
                </div>
              ))}
            </div>
          </div>

          {member.riskScore >= 30 && (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h3 className="font-semibold mb-2">Recommended Actions</h3>
              <ul className="space-y-1 text-sm">
                {member.riskScore >= 60 ? (
                  <>
                    <li>&bull; Enroll in high-risk care management program</li>
                    <li>&bull; Schedule comprehensive surgical consultation</li>
                    <li>&bull; Review conservative treatment options urgently</li>
                    <li>&bull; Consider second opinion referral</li>
                  </>
                ) : (
                  <>
                    <li>&bull; Consider preventive intervention program enrollment</li>
                    <li>&bull; Schedule follow-up assessment in 3-6 months</li>
                    <li>&bull; Recommend physical therapy evaluation</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
