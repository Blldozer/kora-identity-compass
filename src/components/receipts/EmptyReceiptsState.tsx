
import React from 'react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyReceiptsStateProps {
  filter: 'all' | 'matched' | 'unmatched';
  searchTerm: string;
  onCaptureClick: () => void;
}

export function EmptyReceiptsState({ filter, searchTerm, onCaptureClick }: EmptyReceiptsStateProps) {
  return (
    <div className="text-center py-12">
      <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No receipts found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {filter !== 'all' 
          ? `No ${filter} receipts found. Try changing your filter.` 
          : searchTerm 
            ? "No receipts match your search terms." 
            : "Capture your first receipt to get started."}
      </p>
      <Button onClick={onCaptureClick}>Capture Receipt</Button>
    </div>
  );
}
