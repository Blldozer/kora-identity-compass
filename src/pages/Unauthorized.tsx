
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { roles, permissions, refresh } = useRBAC();
  const [missingPermission, setMissingPermission] = useState<string | null>(null);

  useEffect(() => {
    // Extract the required permission from state if available
    const state = location.state as { requiredPermission?: string } | undefined;
    if (state?.requiredPermission) {
      setMissingPermission(state.requiredPermission);
    }

    // Try to refresh roles and permissions
    if (user) {
      refresh();
    }
  }, [location, refresh, user]);

  const handleRefreshRoles = async () => {
    await refresh();
    // Attempt to go back to the previous page
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Unauthorized Access</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              You don't have permission to access this page.
              {missingPermission && (
                <> The required permission is <strong>"{missingPermission}"</strong>.</>
              )}
            </p>
            {roles.length > 0 ? (
              <p>Your current role(s): {roles.map(role => role.name).join(', ')}</p>
            ) : (
              <p>You don't have any roles assigned. Contact an administrator.</p>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleRefreshRoles}
            variant="secondary"
          >
            Refresh Permissions
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Home size={16} />
            Return to Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
