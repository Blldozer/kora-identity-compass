
import React from 'react';
import { CircleCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ReceiptProcessingStatusProps {
  status: 'idle' | 'capturing' | 'processing' | 'success';
  progress: number;
}

export function ReceiptProcessingStatus({ 
  status, 
  progress 
}: ReceiptProcessingStatusProps) {
  if (status === 'processing') {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Processing receipt</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 rounded-md w-full">
        <CircleCheck className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-green-800 font-medium">Receipt processed successfully!</span>
      </div>
    );
  }

  return null;
}
