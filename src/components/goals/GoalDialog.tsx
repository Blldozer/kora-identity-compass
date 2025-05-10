
import React from 'react';
import { Goal } from './GoalCard';
import { GoalForm } from './GoalForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialData?: Goal;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export function GoalDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isSubmitting,
  mode
}: GoalDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Goal' : 'Edit Goal'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Set a new financial goal to help track your progress.' 
              : 'Update your financial goal details.'}
          </DialogDescription>
        </DialogHeader>
        
        <GoalForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={initialData}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
