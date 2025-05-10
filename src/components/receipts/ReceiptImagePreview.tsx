
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptImagePreviewProps {
  imageUrl: string;
  onClear: () => void;
}

export function ReceiptImagePreview({ 
  imageUrl, 
  onClear 
}: ReceiptImagePreviewProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <img 
        src={imageUrl} 
        alt="Captured receipt" 
        className="w-full h-auto rounded-md border border-gray-200"
      />
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute top-2 right-2 bg-white rounded-full" 
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
