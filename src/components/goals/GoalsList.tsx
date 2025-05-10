
import React, { useState } from 'react';
import { Goal, GoalCard } from './GoalCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalsListProps {
  onAddGoal: () => void;
  onSelectGoal: (goal: Goal) => void;
}

export function GoalsList({ onAddGoal, onSelectGoal }: GoalsListProps) {
  const { goals, loading, error } = useGoals();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.current_amount < goal.amount;
    if (filter === 'completed') return goal.current_amount >= goal.amount;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Financial Goals</h2>
          <Button onClick={onAddGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">Failed to load goals</h3>
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Financial Goals</h2>
        <Button onClick={onAddGoal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={filter === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filter === 'active' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button 
          variant={filter === 'completed' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>
      
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">No goals found</h3>
          <p className="text-muted-foreground mt-1">
            {filter !== 'all' 
              ? `You don't have any ${filter} goals yet. Try changing your filter.` 
              : "You haven't created any goals yet. Click 'Add Goal' to get started."}
          </p>
          {filter === 'all' && (
            <Button onClick={onAddGoal} className="mt-4">Create your first goal</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onSelect={onSelectGoal} />
          ))}
        </div>
      )}
    </div>
  );
}
