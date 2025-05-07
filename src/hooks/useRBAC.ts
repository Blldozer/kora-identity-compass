
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export function useRBAC() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRolesAndPermissions = useCallback(async () => {
    if (!user?.id) {
      // No user ID, so we can't fetch roles/permissions
      setRoles([]);
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch user's roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Continue execution instead of throwing - user might not have roles yet
        setRoles([]);
      } else {
        setRoles(userRoles?.map(ur => ur.roles) || []);
      }

      // Only try to fetch permissions if we have roles
      if (userRoles?.length) {
        const roleIds = userRoles.map(role => role.roles.id);
        
        const { data: userPermissions, error: permissionsError } = await supabase
          .from('role_permissions')
          .select(`
            permissions (
              id,
              name,
              description
            )
          `)
          .in('role_id', roleIds);

        if (permissionsError) {
          console.error('Error fetching permissions:', permissionsError);
          setPermissions([]);
        } else {
          setPermissions(userPermissions?.map(up => up.permissions) || []);
        }
      } else {
        // No roles or there was an error - set empty permissions
        setPermissions([]);
      }
    } catch (error) {
      console.error('Unexpected error in RBAC hook:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      // Set empty arrays on error to prevent UI from breaking
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false; // No user = no roles
    return roles.some(role => role.name === roleName);
  }, [roles, user]);

  const hasPermission = useCallback((permissionName: string): boolean => {
    if (!user) return false; // No user = no permissions
    return permissions.some(permission => permission.name === permissionName);
  }, [permissions, user]);

  useEffect(() => {
    fetchUserRolesAndPermissions();
  }, [fetchUserRolesAndPermissions]);

  return {
    roles,
    permissions,
    loading,
    error,
    hasRole,
    hasPermission,
    refresh: fetchUserRolesAndPermissions
  };
}
