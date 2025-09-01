import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session and get user with profile data
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn({ email, password });
      if (result.user && !result.error) {
        setUser(result.user);
      }
      return result;
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await authService.signUp({ email, password, name });
      if (result.user && !result.error) {
        setUser(result.user);
      }
      return result;
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const result = await authService.signOut();
      if (!result.error) {
        setUser(null);
      }
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateUser = async (updates: { full_name?: string; email?: string }) => {
    if (!user) return { error: 'No user logged in' };
    
    try {
      const result = await authService.updateUserProfile(user.id, updates);
      if (!result.error) {
        // Refresh user data
        const updatedUser = await authService.getCurrentUser();
        setUser(updatedUser);
      }
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await authService.resetPassword(email);
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    isAuthenticated,
  };
};