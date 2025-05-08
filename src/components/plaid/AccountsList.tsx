
import React, { useEffect, useState } from 'react';
import { usePlaid, PlaidAccount } from '@/hooks/usePlaid';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaidLink } from './PlaidLink';
import { Home, CreditCard, Building, RefreshCw, Trash2 } from 'lucide-react';

interface AccountsListProps {
  onAccountClick?: (account: PlaidAccount) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  onAccountClick,
}) => {
  const { loading, accounts, getAccounts, syncTransactions, deleteItem } = usePlaid();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [syncingItem, setSyncingItem] = useState<string | null>(null);

  useEffect(() => {
    // Fetch accounts when component mounts
    getAccounts();
  }, [getAccounts]);

  const handleSyncTransactions = async (itemId: string) => {
    setSyncingItem(itemId);
    await syncTransactions(itemId);
    setSyncingItem(null);
  };

  const handleDeleteItem = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem);
      setSelectedItem(null);
      setIsDialogOpen(false);
    }
  };

  const openDeleteDialog = (itemId: string) => {
    setSelectedItem(itemId);
    setIsDialogOpen(true);
  };

  // Group accounts by item
  const accountsByItem: Record<string, {
    institution: string;
    accounts: PlaidAccount[];
  }> = {};

  accounts.forEach(account => {
    if (!accountsByItem[account.item_id]) {
      accountsByItem[account.item_id] = {
        institution: account.plaid_items?.institution_name || 'Financial Institution',
        accounts: []
      };
    }
    accountsByItem[account.item_id].accounts.push(account);
  });

  // Get appropriate icon based on account type
  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      case 'depository':
        return <Building className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  // Format currency amounts
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {loading && accounts.length === 0 ? (
        // Loading state
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(accountsByItem).length === 0 ? (
            // No accounts state
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No accounts connected</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Connect your financial accounts to get started with Kora.
              </p>
              <PlaidLink
                buttonText="Connect Your First Account"
                className="mx-auto"
                size="lg"
              />
            </div>
          ) : (
            // Accounts list
            Object.entries(accountsByItem).map(([itemId, { institution, accounts }]) => (
              <Card key={itemId} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{institution}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncTransactions(itemId)}
                        disabled={syncingItem === itemId}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${syncingItem === itemId ? 'animate-spin' : ''}`} />
                        {syncingItem === itemId ? 'Syncing...' : 'Sync'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(itemId)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-muted">
                    {accounts.map((account) => (
                      <li 
                        key={account.id} 
                        className={`p-4 hover:bg-muted/50 transition-colors ${onAccountClick ? 'cursor-pointer' : ''}`}
                        onClick={() => onAccountClick && onAccountClick(account)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              {getAccountIcon(account.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{account.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {account.type} {account.subtype ? `• ${account.subtype}` : ''}
                                {account.mask ? ` • ****${account.mask}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(account.balance_current)}
                            </p>
                            {account.balance_available !== null && account.balance_available !== account.balance_current && (
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(account.balance_available)} available
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="bg-muted/30 py-2 px-4 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {new Date(accounts[0].updated_at).toLocaleString()}
                  </span>
                </CardFooter>
              </Card>
            ))
          )}

          {Object.entries(accountsByItem).length > 0 && (
            <div className="flex justify-center mt-4">
              <PlaidLink 
                buttonText="Connect Another Account"
                variant="outline"
                onSuccess={() => getAccounts()}
              />
            </div>
          )}
        </div>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Financial Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all account data including transaction history from Kora.
              You can always reconnect your account later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
