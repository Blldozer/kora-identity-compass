
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

export interface Goal {
  id: string;
  name: string;
  amount: number;
  current_amount: number;
  category: string;
  due_date: string;
  created_at: string;
  user_id: string;
}

interface GoalCardProps {
  goal: Goal;
  onSelect?: (goal: Goal) => void;
}

export function GoalCard({ goal, onSelect }: GoalCardProps) {
  // Calculate progress percentage
  const progress = Math.min((goal.current_amount / goal.amount) * 100, 100);
  const isCompleted = goal.current_amount >= goal.amount;
  
  // Calculate days remaining
  const dueDate = new Date(goal.due_date);
  const today = new Date();
  const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  return (
    <Card 
      className={`${isCompleted ? 'border-green-400' : ''} hover:shadow-md transition-shadow`}
      onClick={() => onSelect?.(goal)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{goal.name}</CardTitle>
          <Badge variant={isCompleted ? "success" : daysRemaining < 7 ? "destructive" : "secondary"}>
            {isCompleted ? 'Completed' : daysRemaining <= 0 ? 'Overdue' : `${daysRemaining} days left`}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          {goal.category}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {formatCurrency(goal.current_amount)} of {formatCurrency(goal.amount)}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <div className="text-sm text-muted-foreground w-full flex justify-between">
          <span>Due: {new Date(goal.due_date).toLocaleDateString()}</span>
          <span>{progress.toFixed(0)}% complete</span>
        </div>
      </CardFooter>
    </Card>
  );
}
