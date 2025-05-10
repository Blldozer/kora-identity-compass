
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureHighlightProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export function FeatureHighlight({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
}: FeatureHighlightProps) {
  return (
    <div className={cn("flex flex-col items-center text-center p-4 animate-fade-in", className)}>
      <div className={cn(
        "mb-4 rounded-full p-3 bg-gradient-to-br from-kora-orange/20 to-kora-blue/10",
        iconClassName
      )}>
        <Icon className="h-6 w-6 text-kora-orange" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

export function FeatureGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {children}
    </div>
  );
}
