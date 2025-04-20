
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LockoutAlertProps {
  remainingMinutes: number | null;
}

export const LockoutAlert = ({ remainingMinutes }: LockoutAlertProps) => {
  if (remainingMinutes === null) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Account temporarily locked due to multiple failed login attempts. 
        {remainingMinutes > 0 && (
          <span> Please try again in {remainingMinutes} {remainingMinutes === 1 ? 'minute' : 'minutes'}.</span>
        )}
      </AlertDescription>
    </Alert>
  );
};
