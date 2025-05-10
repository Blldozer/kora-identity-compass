
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/components/goals/GoalCard';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all goals for the current user
  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Create a new goal
  const createGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create goals',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            ...goalData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Goal created',
        description: 'Your financial goal has been created successfully',
      });

      // Refresh goals list
      await fetchGoals();
      return data;
    } catch (err: any) {
      console.error('Error creating goal:', err);
      toast({
        title: 'Failed to create goal',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update an existing goal
  const updateGoal = async (id: string, goalData: Partial<Goal>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Goal updated',
        description: 'Your financial goal has been updated successfully',
      });

      // Refresh goals list
      await fetchGoals();
      return true;
    } catch (err: any) {
      console.error('Error updating goal:', err);
      toast({
        title: 'Failed to update goal',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a goal
  const deleteGoal = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Goal deleted',
        description: 'Your financial goal has been deleted',
      });

      // Update local state
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      toast({
        title: 'Failed to delete goal',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Fetch goals when user changes
  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
