
import { useState, useEffect } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check - in a real app, this would check with Supabase
    const checkAuth = async () => {
      try {
        // For demo purposes, we'll simulate a logged-in admin user
        // In production, this would integrate with Discord OAuth and Supabase
        const mockUser: User = {
          id: 'demo-admin',
          discord_id: '123456789',
          discord_username: 'AdminUser',
          roles: ['owner'], // Can be 'owner', 'admin', or 'member'
          created_at: new Date().toISOString(),
        };
        
        setUser(mockUser);
        console.log('Auth check completed, user:', mockUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const hasRole = (requiredRoles: string[]): boolean => {
    if (!user) return false;
    return user.roles.some(role => requiredRoles.includes(role));
  };

  const isAdmin = (): boolean => {
    return hasRole(['owner', 'admin']);
  };

  const logout = () => {
    setUser(null);
    console.log('User logged out');
  };

  return {
    user,
    loading,
    hasRole,
    isAdmin,
    logout,
  };
}
