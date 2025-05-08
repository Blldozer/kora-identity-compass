
import React, { useEffect, useState } from 'react';
import { usePlaid, PlaidTransaction, PlaidAccount } from '@/hooks/usePlaid';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Search, Calendar, Filter } from 'lucide-react';

interface TransactionsListProps {
  accountId?: string;
  limit?: number;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  accountId,
  limit = 25,
}) => {
  const { loading, transactions, getTransactions, accounts, getAccounts } = usePlaid();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(accountId);
  const [pagination, setPagination] = useState({
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  });

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 days ago
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  useEffect(() => {
    loadTransactions();
  }, [selectedAccount, startDate, endDate, pagination.offset, pagination.limit]);

  const loadTransactions = async () => {
    const result = await getTransactions({
      accountId: selectedAccount,
      startDate,
      endDate,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    setPagination({
      total: result.pagination.total,
      limit: result.pagination.limit,
      offset: result.pagination.offset,
      hasMore: result.pagination.has_more,
    });
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  // Filter transactions by search term
  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.name.toLowerCase().includes(searchLower) ||
      (transaction.merchant_name && transaction.merchant_name.toLowerCase().includes(searchLower)) ||
      (transaction.category && transaction.category.some(cat => cat.toLowerCase().includes(searchLower)))
    );
  });

  // Format currency amounts
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transactions</CardTitle>
        <CardDescription>
          View and manage your financial transactions
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={selectedAccount || ''}
            onValueChange={(value) => setSelectedAccount(value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} {account.mask ? `(****${account.mask})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-8"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-8"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No transactions found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.length === 0 
                ? "Connect an account and sync transactions to see your financial activity" 
                : "Try adjusting your filters to see more transactions"}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(transaction.date)}
                      {transaction.pending && (
                        <Badge variant="outline" className="ml-2 text-xs">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.name}</div>
                      {transaction.merchant_name && transaction.merchant_name !== transaction.name && (
                        <div className="text-xs text-muted-foreground">{transaction.merchant_name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.plaid_accounts?.name || "Unknown Account"}
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <div className="flex flex-wrap gap-1">
                          {transaction.category.slice(0, 2).map((cat, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right ${transaction.amount < 0 ? 'text-green-600' : ''}`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1}-
                {Math.min(pagination.offset + filteredTransactions.length, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
