import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedView {
  id: string;
  name: string;
  model_type: string;
  risk_type: 'relative' | 'absolute';
  timeframe: string;
  outcomes: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedViewInput {
  name: string;
  model_type: string;
  risk_type: 'relative' | 'absolute';
  timeframe: string;
  outcomes: string[];
}

export const useSavedViews = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all saved views (shared across all users)
  const { data: savedViews, isLoading, error } = useQuery({
    queryKey: ['saved-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_views')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved views:', error);
        throw error;
      }

      // Transform the data to ensure outcomes is an array
      return (data || []).map(view => ({
        ...view,
        risk_type: view.risk_type as 'relative' | 'absolute',
        outcomes: Array.isArray(view.outcomes) ? view.outcomes as string[] : []
      })) as SavedView[];
    }
  });

  // Create a new saved view
  const createViewMutation = useMutation({
    mutationFn: async (input: SavedViewInput) => {
      // Get current user to track who created the view (optional)
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('saved_views')
        .insert({
          name: input.name,
          model_type: input.model_type,
          risk_type: input.risk_type,
          timeframe: input.timeframe,
          outcomes: input.outcomes,
          created_by: user?.id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating saved view:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views'] });
      toast({
        title: 'View saved',
        description: 'Your view has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving view',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update an existing saved view
  const updateViewMutation = useMutation({
    mutationFn: async ({ id, ...input }: SavedViewInput & { id: string }) => {
      const { data, error } = await supabase
        .from('saved_views')
        .update({
          name: input.name,
          model_type: input.model_type,
          risk_type: input.risk_type,
          timeframe: input.timeframe,
          outcomes: input.outcomes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating saved view:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views'] });
      toast({
        title: 'View updated',
        description: 'Your view has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating view',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete a saved view
  const deleteViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_views')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting saved view:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views'] });
      toast({
        title: 'View deleted',
        description: 'Your view has been deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting view',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    savedViews: savedViews || [],
    isLoading,
    error,
    createView: createViewMutation.mutate,
    createViewAsync: createViewMutation.mutateAsync,
    updateView: updateViewMutation.mutate,
    deleteView: deleteViewMutation.mutate,
    isCreating: createViewMutation.isPending,
    isUpdating: updateViewMutation.isPending,
    isDeleting: deleteViewMutation.isPending,
  };
};
