
export interface MockReceipt {
  id: string;
  merchantName: string;
  amount: number;
  date: Date;
  imageUrl: string;
  matched: boolean;
  categories: string[];
}
