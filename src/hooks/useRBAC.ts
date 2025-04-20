
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

  const fetchUserRolesAndPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
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

      if (rolesError) throw rolesError;

      // Fetch permissions for user's roles
      const { data: userPermissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          permissions (
            id,
            name,
            description
          )
        `)
        .in('role_id', userRoles?.map(role => role.roles.id) || []);

      if (permissionsError) throw permissionsError;

      setRoles(userRoles?.map(ur => ur.roles) || []);
      setPermissions(userPermissions?.map(up => up.permissions) || []);
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const hasRole = useCallback((roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  }, [roles]);

  const hasPermission = useCallback((permissionName: string): boolean => {
    return permissions.some(permission => permission.name === permissionName);
  }, [permissions]);

  useEffect(() => {
    fetchUserRolesAndPermissions();
  }, [fetchUserRolesAndPermissions]);

  return {
    roles,
    permissions,
    loading,
    hasRole,
    hasPermission,
    refresh: fetchUserRolesAndPermissions
  };
}
