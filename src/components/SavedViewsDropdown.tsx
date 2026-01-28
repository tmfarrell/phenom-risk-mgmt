import { useState } from 'react';
import { ChevronDown, Save, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SavedView } from '@/hooks/useSavedViews';
import { cn } from '@/lib/utils';

interface SavedViewsDropdownProps {
  savedViews: SavedView[];
  isLoading: boolean;
  onSaveClick: () => void;
  onSelectView: (view: SavedView) => void;
  onDeleteView: (id: string) => void;
  isDeleting: boolean;
  currentViewId?: string;
}

const MODEL_TYPE_LABELS: Record<string, string> = {
  future_risk: 'Future Risk',
  screening: 'Screening',
  care_opportunity: 'Care Opportunity',
};

export const SavedViewsDropdown = ({
  savedViews,
  isLoading,
  onSaveClick,
  onSelectView,
  onDeleteView,
  isDeleting,
  currentViewId,
}: SavedViewsDropdownProps) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const viewToDelete = savedViews.find(v => v.id === deleteConfirmId);
  const currentView = currentViewId ? savedViews.find(v => v.id === currentViewId) : null;

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteView(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-48 justify-between">
            <span className={cn(
              "truncate",
              !currentView && "text-muted-foreground"
            )}>
              {currentView ? currentView.name : "No View Selected"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={onSaveClick} className="cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            Save Current Panel View...
          </DropdownMenuItem>
          
          {savedViews.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Saved Views
              </DropdownMenuLabel>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                savedViews.map((view) => (
                  <DropdownMenuItem
                    key={view.id}
                    onClick={() => onSelectView(view)}
                    className={cn(
                      "cursor-pointer flex items-center justify-between group",
                      currentViewId === view.id && "bg-accent"
                    )}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{view.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {MODEL_TYPE_LABELS[view.model_type] || view.model_type}
                        {view.model_type === 'future_risk' && ` · ${view.timeframe}yr`}
                        {' · '}{view.outcomes.length} outcomes
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, view.id)}
                      className="ml-2 p-1 rounded hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete view"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </>
          )}
          
          {!isLoading && savedViews.length === 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                No saved views yet
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved view?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{viewToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
