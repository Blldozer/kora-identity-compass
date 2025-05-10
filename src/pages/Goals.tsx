
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GoalsList } from '@/components/goals/GoalsList';
import { GoalDialog } from '@/components/goals/GoalDialog';
import { useGoals } from '@/hooks/useGoals';
import { Goal } from '@/components/goals/GoalCard';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

const Goals = () => {
  const { user } = useAuth();
  const { goals, createGoal, updateGoal, deleteGoal, loading } = useGoals();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const handleAddGoal = () => {
    setSelectedGoal(undefined);
    setDialogMode('create');
    setIsGoalDialogOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setDialogMode('edit');
    setIsGoalDialogOpen(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await createGoal(values);
      } else if (selectedGoal) {
        await updateGoal(selectedGoal.id, values);
      }
      setIsGoalDialogOpen(false);
    } catch (error) {
      console.error('Error submitting goal:', error);
      toast({
        title: 'Something went wrong',
        description: 'Failed to save your goal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedGoal) return;
    
    try {
      await deleteGoal(selectedGoal.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the goal. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Please log in</h1>
          <p className="mb-6 text-muted-foreground">
            You need to be logged in to view and manage your financial goals.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress towards your financial goals
          </p>
        </div>

        {/* Goals List */}
        <GoalsList
          onAddGoal={handleAddGoal}
          onSelectGoal={handleEditGoal}
        />

        {/* Goal Dialog for Create/Edit */}
        <GoalDialog
          isOpen={isGoalDialogOpen}
          onClose={() => setIsGoalDialogOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedGoal}
          isSubmitting={isSubmitting}
          mode={dialogMode}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your goal
                "{selectedGoal?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Goals;
