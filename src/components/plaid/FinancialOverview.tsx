
import React, { useEffect, useState } from 'react';
import { usePlaid, PlaidAccount } from '@/hooks/usePlaid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const FinancialOverview: React.FC = () => {
  const { loading, accounts, connectionError, getAccounts, isDevelopmentMode } = usePlaid();
  const [totalBalance, setTotalBalance] = useState(0);
  const [accountTypeData, setAccountTypeData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  const COLORS = ['#0A2463', '#3E92CC', '#F26419', '#F9C784', '#8AC926', '#FF595E'];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setError(null);
        await getAccounts();
        
        // If we're still getting errors after 3 attempts, stop retrying
        if (connectionError && retryCount >= 3) {
          setError(connectionError);
          return;
        }
        
        // If there's an error, retry up to 3 times with increasing delay
        if (connectionError && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Error fetching accounts, retrying in ${delay}ms...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      } catch (err) {
        console.error("Error in FinancialOverview component:", err);
        setError("Unable to load financial data. Please try again later.");
      } finally {
        setIsInitialLoad(false);
      }
    };
    
    fetchAccounts();
    
    // Refresh data every 2 minutes if the component is visible
    const interval = setInterval(fetchAccounts, 120000);
    
    return () => {
      clearInterval(interval);
    };
  }, [getAccounts, connectionError, retryCount]);

  useEffect(() => {
    if (accounts.length > 0) {
      try {
        // Calculate total balance
        const total = accounts.reduce((sum, account) => {
          return sum + (account.balance_current || 0);
        }, 0);
        setTotalBalance(total);

        // Group accounts by type for chart
        const accountTypes: Record<string, number> = {};
        accounts.forEach(account => {
          const type = account.type.charAt(0).toUpperCase() + account.type.slice(1);
          accountTypes[type] = (accountTypes[type] || 0) + (account.balance_current || 0);
        });

        // Convert to data array for chart
        const chartData = Object.entries(accountTypes).map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));
        
        setAccountTypeData(chartData);
      } catch (err) {
        console.error("Error processing account data:", err);
        setError("Error processing financial data");
      }
    }
  }, [accounts]);

  // Format currency amounts
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate asset and liability totals
  const assetTotal = accounts
    .filter(account => ['depository', 'investment', 'other'].includes(account.type))
    .reduce((sum, account) => sum + (account.balance_current || 0), 0);

  const liabilityTotal = accounts
    .filter(account => ['credit', 'loan'].includes(account.type))
    .reduce((sum, account) => sum + (account.balance_current || 0), 0);

  const netWorth = assetTotal - liabilityTotal;
  
  const isDevMode = isDevelopmentMode();

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {isDevMode && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Development Mode</AlertTitle>
            <AlertDescription>
              You are currently in development/sandbox mode. Make sure your Plaid API keys are correctly configured in Supabase.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Verify that PLAID_CLIENT_ID is set to your Plaid client ID</li>
                <li>Verify that PLAID_SECRET is set to your sandbox secret</li>
                <li>Verify that PLAID_ENV is set to "sandbox"</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {isDevMode && (
        <Alert className="md:col-span-2">
          <Info className="h-4 w-4" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            You are running in development/sandbox mode. Connect test bank accounts using sandbox credentials.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Overview of your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                {isInitialLoad ? "Loading your accounts..." : "Connect your accounts to see your financial summary"}
              </p>
              {isDevMode && !isInitialLoad && (
                <p className="text-xs text-muted-foreground mt-2">
                  In sandbox mode, you can use test credentials during the connection flow.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Net Worth</h3>
                    <span className="text-xl font-semibold">{formatCurrency(netWorth)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Assets</span>
                    <span className="text-sm">{formatCurrency(assetTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Liabilities</span>
                    <span className="text-sm">{formatCurrency(liabilityTotal)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Account Types</h3>
                  </div>
                  {accountTypeData.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs">{item.name}</span>
                        <span className="text-xs">{formatCurrency(item.value)}</span>
                      </div>
                      <Progress value={(item.value / totalBalance) * 100} className="h-2" 
                        style={{backgroundColor: `${item.color}20`, '--progress-fill': item.color} as any}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Distribution</CardTitle>
          <CardDescription>Breakdown of your financial accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                {isInitialLoad ? "Loading your accounts..." : "Connect your accounts to see your account distribution"}
              </p>
              {isDevMode && !isInitialLoad && (
                <p className="text-xs text-muted-foreground mt-2">
                  Use the "Connect Account" button to add test accounts using sandbox credentials.
                </p>
              )}
            </div>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {accountTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
