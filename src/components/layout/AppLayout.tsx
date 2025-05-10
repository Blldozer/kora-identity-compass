
import React from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn("pb-0", isMobile && "pb-16")}>
        {children}
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
};
