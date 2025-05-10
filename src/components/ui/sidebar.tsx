import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Home, LayoutDashboard, Settings, User, CreditCard, Goal } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = () => {
  const { user } = useAuth();
  
  return (
    <aside className="bg-gray-50 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out border-r">
      <Link to="/" className="flex items-center space-x-2 px-4">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <span className="text-2xl font-extrabold">Dashboard</span>
      </Link>
      <nav className="mt-8">
        <Link to="/" className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-100">
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link to="/profile" className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-100">
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
        <Link to="/finances" className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-100">
          <CreditCard className="h-5 w-5" />
          <span>Finances</span>
        </Link>
        
        <Link to="/goals" className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-100">
          <Goal className="h-5 w-5" />
          <span>Financial Goals</span>
        </Link>
        
        <Link to="/settings" className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-100">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>
      
      {user && (
        <div className="mt-auto px-4">
          <p className="text-sm text-muted-foreground">
            Logged in as {user.email}
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
