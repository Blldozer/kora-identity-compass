
import React, { useState } from 'react';
import { KoraWaveBackground } from '@/components/ui/kora-wave-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Receipt, Upload, X, CircleCheck, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ReceiptCapture } from '@/components/receipts/ReceiptCapture';
import { ReceiptGallery } from '@/components/receipts/ReceiptGallery';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Receipts = () => {
  const { user } = useAuth();
  const [showCapture, setShowCapture] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Please log in</h1>
          <p className="mb-6 text-muted-foreground">
            You need to be logged in to manage receipts.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <KoraWaveBackground />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Your Receipts</h1>
          <p className="text-muted-foreground mt-1">
            Capture, organize, and track your spending with detailed receipt data
          </p>
        </div>

        {showCapture ? (
          <ReceiptCapture 
            onClose={() => setShowCapture(false)}
            onSuccess={() => {
              setShowCapture(false);
              // Refresh receipts list
            }}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Receipts</TabsTrigger>
                  <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
                  <TabsTrigger value="matched">Matched</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex w-full md:w-auto space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search receipts..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button onClick={() => setShowCapture(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Receipt
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Receipt Gallery</CardTitle>
                <CardDescription>
                  View and manage your captured receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContent value="all" className="mt-0">
                  <ReceiptGallery filter="all" searchTerm={searchTerm} />
                </TabsContent>
                <TabsContent value="unmatched" className="mt-0">
                  <ReceiptGallery filter="unmatched" searchTerm={searchTerm} />
                </TabsContent>
                <TabsContent value="matched" className="mt-0">
                  <ReceiptGallery filter="matched" searchTerm={searchTerm} />
                </TabsContent>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Receipts;
