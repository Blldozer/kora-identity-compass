
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  skipRbacCheck?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission,
  skipRbacCheck = false
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, hasPermission, loading: rbacLoading } = useRBAC();
  const location = useLocation();

  // Show loading state while authentication is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-blue-600 rounded mb-3"></div>
          <p className="text-gray-500">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Skip RBAC checks if explicitly told to or if no specific permissions/roles are required
  if (skipRbacCheck || (!requiredRole && !requiredPermission)) {
    return <>{children}</>;
  }

  // Only check permissions if we're done loading them and if specific permissions/roles are required
  if (rbacLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-blue-600 rounded mb-3"></div>
          <p className="text-gray-500">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Check for required role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`Missing required role: ${requiredRole}`);
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredPermission: requiredRole, from: location }} 
        replace 
      />
    );
  }

  // Check for required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`Missing required permission: ${requiredPermission}`);
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredPermission, from: location }} 
        replace 
      />
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};
