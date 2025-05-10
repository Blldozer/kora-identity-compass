
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountsList } from '@/components/plaid/AccountsList';
import { TransactionsList } from '@/components/plaid/TransactionsList';
import { FinancialOverview } from '@/components/plaid/FinancialOverview';
import { PlaidLink } from '@/components/plaid/PlaidLink';
import { useAuth } from '@/hooks/useAuth';
import { PlaidAccount } from '@/hooks/usePlaid';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Finances = () => {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<PlaidAccount | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAccountClick = (account: PlaidAccount) => {
    setSelectedAccountId(account.id);
    setSelectedAccount(account);
    setActiveTab('transactions');
  };

  const handleBackToAccounts = () => {
    setSelectedAccountId(undefined);
    setSelectedAccount(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Please log in</h1>
          <p className="mb-6 text-muted-foreground">
            You need to be logged in to view your financial information.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Your Finances</h1>
          <p className="text-muted-foreground mt-1">
            Manage your accounts, track spending, and monitor your financial health
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          {selectedAccount ? (
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToAccounts} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to All Accounts
              </Button>
              <h2 className="text-xl font-medium">
                {selectedAccount.plaid_items?.institution_name}: {selectedAccount.name}
              </h2>
            </div>
          ) : (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {!selectedAccount && (
            <div>
              <PlaidLink 
                buttonText="Connect Account"
                products={['auth', 'transactions', 'identity', 'investments', 'liabilities']}
              />
            </div>
          )}
        </div>

        {selectedAccount ? (
          <TransactionsList accountId={selectedAccountId} limit={50} />
        ) : (
          <Tabs value={activeTab}>
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-6">
                <FinancialOverview />
              </div>
            </TabsContent>
            
            <TabsContent value="accounts" className="mt-0">
              <AccountsList onAccountClick={handleAccountClick} />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <TransactionsList limit={25} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Finances;
