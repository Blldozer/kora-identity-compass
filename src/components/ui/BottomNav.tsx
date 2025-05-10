
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Flag, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Finances',
    path: '/finances',
    icon: CreditCard,
  },
  {
    name: 'Goals',
    path: '/goals',
    icon: Flag,
  },
  {
    name: 'Transactions',
    path: '/transactions',
    icon: FileText,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export const BottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200 shadow-lg flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path !== '/' && location.pathname.startsWith(item.path));
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full h-full px-1 py-1 transition-colors",
              isActive 
                ? "text-primary" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              isActive ? "stroke-primary" : "stroke-gray-500"
            )} />
            <span className="text-xs font-medium">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
