
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiptCard } from './ReceiptCard';
import { EmptyReceiptsState } from './EmptyReceiptsState';
import { getMockReceipts } from '@/data/mockReceipts';
import { MockReceipt } from '@/models/MockReceipt';

interface ReceiptGalleryProps {
  filter: 'all' | 'matched' | 'unmatched';
  searchTerm: string;
}

export function ReceiptGallery({ filter, searchTerm }: ReceiptGalleryProps) {
  // In a real application, this would be fetched from an API
  const [loading, setLoading] = useState(false);
  const [mockReceipts] = useState<MockReceipt[]>(getMockReceipts());

  // Filter receipts based on the current tab and search term
  const filteredReceipts = mockReceipts.filter(receipt => {
    // Apply tab filter
    if (filter === 'matched' && !receipt.matched) return false;
    if (filter === 'unmatched' && receipt.matched) return false;
    
    // Apply search term filter
    if (searchTerm && !receipt.merchantName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleCaptureClick = () => {
    // This would typically navigate to capture screen or open capture modal
    // For now, just log to console
    console.log('Capture receipt clicked');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredReceipts.length === 0) {
    return <EmptyReceiptsState filter={filter} searchTerm={searchTerm} onCaptureClick={handleCaptureClick} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredReceipts.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}
    </div>
  );
}
