
export interface Receipt {
  id: string;
  userId: string;
  merchantName: string;
  merchantId?: string;
  amount: number;
  taxAmount?: number;
  tipAmount?: number;
  currency: string;
  date: Date;
  items: ReceiptItem[];
  categories: string[];
  imageUrl: string;
  matchedTransactionId?: string;
  status: 'pending' | 'processed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  sku?: string;
  upc?: string;
}
