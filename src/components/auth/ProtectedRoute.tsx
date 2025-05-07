
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, hasPermission, loading: rbacLoading } = useRBAC();
  const location = useLocation();

  if (authLoading || rbacLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-blue-600 rounded mb-3"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredPermission: requiredRole, from: location }} 
        replace 
      />
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredPermission, from: location }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};
