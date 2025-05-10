
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { MockReceipt } from '@/models/MockReceipt';

interface ReceiptCardProps {
  receipt: MockReceipt;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  return (
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
  );
}
