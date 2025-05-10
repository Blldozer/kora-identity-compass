
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, FileText, LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ReceiptGalleryProps {
  filter: 'all' | 'matched' | 'unmatched';
  searchTerm: string;
}

interface MockReceipt {
  id: string;
  merchantName: string;
  amount: number;
  date: Date;
  imageUrl: string;
  matched: boolean;
  categories: string[];
}

export function ReceiptGallery({ filter, searchTerm }: ReceiptGalleryProps) {
  // In a real application, this would be fetched from an API
  const [loading, setLoading] = useState(false);
  const [mockReceipts, setMockReceipts] = useState<MockReceipt[]>([
    {
      id: '1',
      merchantName: 'Whole Foods Market',
      amount: 87.32,
      date: new Date(2025, 4, 8),
      imageUrl: 'https://placehold.co/300x400/e9ecef/6c757d?text=Receipt+1',
      matched: true,
      categories: ['Groceries', 'Health']
    },
    {
      id: '2',
      merchantName: 'Target',
      amount: 124.56,
      date: new Date(2025, 4, 7),
      imageUrl: 'https://placehold.co/300x400/e9ecef/6c757d?text=Receipt+2',
      matched: false,
      categories: ['Shopping', 'Household']
    },
    {
      id: '3',
      merchantName: 'Home Depot',
      amount: 213.45,
      date: new Date(2025, 4, 5),
      imageUrl: 'https://placehold.co/300x400/e9ecef/6c757d?text=Receipt+3',
      matched: true,
      categories: ['Home Improvement']
    },
    {
      id: '4',
      merchantName: 'CVS Pharmacy',
      amount: 42.18,
      date: new Date(2025, 4, 3),
      imageUrl: 'https://placehold.co/300x400/e9ecef/6c757d?text=Receipt+4',
      matched: false,
      categories: ['Health', 'Personal Care']
    },
  ]);

  // Filter receipts based on the current tab
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

  // Format currency amounts
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredReceipts.length === 0) {
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
        <Button>Capture Receipt</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredReceipts.map((receipt) => (
        <Card key={receipt.id} className="overflow-hidden group hover:shadow-md transition-shadow">
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <img 
              src={receipt.imageUrl} 
              alt={`Receipt from ${receipt.merchantName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <FileText className="h-4 w-4 mr-1" />
                  View
                </Button>
                {!receipt.matched && (
                  <Button size="sm" variant="secondary">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Match
                  </Button>
                )}
              </div>
            </div>
            
            {/* Status badge */}
            <div className="absolute top-2 right-2">
              {receipt.matched ? (
                <Badge className="bg-green-500">Matched</Badge>
              ) : (
                <Badge variant="outline" className="bg-white">Unmatched</Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium truncate">{receipt.merchantName}</h3>
              <span className="font-medium">{formatCurrency(receipt.amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDistanceToNow(receipt.date, { addSuffix: true })}</span>
              <div className="flex gap-1">
                {receipt.categories.slice(0, 2).map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
