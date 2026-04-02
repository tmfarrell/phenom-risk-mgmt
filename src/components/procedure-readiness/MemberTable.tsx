import { useState, useMemo } from 'react';
import { ArrowUpDown, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Member } from '@/types/procedure-readiness';
import { exportMembersToCSV } from '@/utils/procedureReadiness/riskCalculator';
import { Badge } from '@/components/ui/badge';
import { MemberDetailModal } from './MemberDetailModal';

interface MemberTableProps {
  members: Member[];
  procedureName: string;
}

type SortKey = 'riskScore' | 'absoluteProbability' | 'age' | 'lastName';

export function MemberTable({ members, procedureName }: MemberTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 15;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.memberId.toLowerCase().includes(query) ||
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return ((aValue as number) - (bValue as number)) * modifier;
    });

    return result;
  }, [members, sortKey, sortDirection, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const paginatedMembers = filteredAndSortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownload = () => {
    const csv = exportMembersToCSV(filteredAndSortedMembers, procedureName);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk_analysis_${procedureName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskBadge = (score: number) => {
    if (score >= 60) {
      return <Badge variant="destructive">High Risk</Badge>;
    }
    if (score >= 30) {
      return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Medium Risk</Badge>;
    }
    return <Badge className="bg-success text-success-foreground hover:bg-success/90">Low Risk</Badge>;
  };

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or member ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Member ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2 font-semibold"
                  onClick={() => handleSort('age')}
                >
                  Age
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2 font-semibold"
                  onClick={() => handleSort('riskScore')}
                >
                  Risk Score
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2 font-semibold"
                  onClick={() => handleSort('absoluteProbability')}
                >
                  Probability (12mo)
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="font-semibold">Relative Rate</TableHead>
              <TableHead className="font-semibold">Risk Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.map((member) => (
              <TableRow 
                key={member.id} 
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => handleMemberClick(member)}
              >
                <TableCell className="font-mono text-sm">{member.memberId}</TableCell>
                <TableCell className="font-medium">
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{member.age}</TableCell>
                <TableCell className="font-semibold">{member.riskScore}</TableCell>
                <TableCell className="font-semibold">{member.absoluteProbability}%</TableCell>
                <TableCell>{member.relativeRate}x</TableCell>
                <TableCell>{getRiskBadge(member.riskScore)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} members
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <MemberDetailModal
        member={selectedMember}
        procedureName={procedureName}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
