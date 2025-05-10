
import { MockReceipt } from '@/models/MockReceipt';

// Mock receipts data that would normally come from an API
export const getMockReceipts = (): MockReceipt[] => [
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
];
