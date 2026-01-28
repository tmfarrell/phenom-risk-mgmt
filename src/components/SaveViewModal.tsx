import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SortingState } from '@tanstack/react-table';

interface SaveViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  isSaving: boolean;
  currentView: {
    modelType: string;
    riskType: 'relative' | 'absolute';
    timeframe: string;
    outcomes: string[];
    sorting: SortingState;
  };
  outcomeLabels?: Record<string, string>;
}

const MODEL_TYPE_LABELS: Record<string, string> = {
  future_risk: 'Future Risk',
  screening: 'Screening',
  care_opportunity: 'Care Opportunity',
};

export const SaveViewModal = ({
  open,
  onOpenChange,
  onSave,
  isSaving,
  currentView,
  outcomeLabels,
}: SaveViewModalProps) => {
  const [viewName, setViewName] = useState('');

  const handleSave = () => {
    if (viewName.trim()) {
      onSave(viewName.trim());
      setViewName('');
    }
  };

  const handleClose = () => {
    setViewName('');
    onOpenChange(false);
  };

  const formatTimeframe = (timeframe: string): string => {
    const years = parseFloat(timeframe);
    if (years < 1) {
      const months = Math.round(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${timeframe} year${years !== 1 ? 's' : ''}`;
  };

  const formatSorting = (sorting: SortingState): string => {
    if (!sorting || sorting.length === 0) {
      return 'Default (Composite Risk - High to Low)';
    }
    const sort = sorting[0];
    const direction = sort.desc ? 'High to Low' : 'Low to High';
    
    // Map column IDs to user-friendly names
    let columnName: string;
    if (sort.id === 'composite_risk') {
      columnName = 'Composite Risk';
    } else if (sort.id === 'name') {
      columnName = 'Patient Name';
    } else if (sort.id === 'mrn') {
      columnName = 'MRN';
    } else if (sort.id === 'age') {
      columnName = 'Age';
    } else if (sort.id === 'gender') {
      columnName = 'Gender';
    } else {
      // It's likely an outcome column, try to get label
      columnName = outcomeLabels?.[sort.id] || sort.id;
    }
    
    return `${columnName} (${direction})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Panel View</DialogTitle>
          <DialogDescription>
            Save your current filter settings to access later. 
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="view-name">View Name</Label>
            <Input
              id="view-name"
              placeholder="e.g., High Risk Cardiac Patients"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && viewName.trim()) {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
          <div className="space-y-3 pt-2">
            <Label className="text-muted-foreground">Current Settings</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Model Type:</div>
              <div className="font-medium">{MODEL_TYPE_LABELS[currentView.modelType] || currentView.modelType}</div>
              
              <div className="text-muted-foreground">Risk Type:</div>
              <div className="font-medium capitalize">{currentView.riskType}</div>
              
              {currentView.modelType === 'future_risk' && (
                <>
                  <div className="text-muted-foreground">Time Period:</div>
                  <div className="font-medium">{formatTimeframe(currentView.timeframe)}</div>
                </>
              )}
              
              <div className="text-muted-foreground">Sort By:</div>
              <div className="font-medium">{formatSorting(currentView.sorting)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Outcomes ({currentView.outcomes.length}):</div>
              <div className="flex flex-wrap gap-1">
                {currentView.outcomes.slice(0, 6).map((outcome) => (
                  <Badge key={outcome} variant="secondary" className="text-xs">
                    {outcomeLabels?.[outcome] || outcome}
                  </Badge>
                ))}
                {currentView.outcomes.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{currentView.outcomes.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!viewName.trim() || isSaving}>
            {isSaving ? 'Saving...' : 'Save View'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
