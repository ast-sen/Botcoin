import { supabase } from '../utils/supabase';
import { 
  User, 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse 
} from '../types/auth.types';

class AuthService {
  async signUp(credentials: SignupCredentials): Promise<AuthResponse> {   
  try {
    console.log('🔄 Starting signup process for:', credentials.email);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        },
      },
    });

    if (authError) {
      console.log('❌ Auth user creation failed:', authError);
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      console.log('❌ No user returned from auth signup');
      return { user: null, error: 'Failed to create user account' };
    }

    console.log('✅ Auth user created with ID:', authData.user.id);
    console.log('✅ Profile automatically created by database trigger');

    return { 
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: credentials.name,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at!,
      }, 
      error: null 
    };

  } catch (error: any) {
    console.log('❌ Signup exception:', error);
    return { user: null, error: error.message };
  }
}

  // Sign in existing user
async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    console.log('🔄 Starting signin process for:', credentials.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.log('❌ Signin failed:', error.message);
      return { user: null, error: error.message };
    }

    if (!data.user) {
      console.log('❌ No user returned from signin');
      return { user: null, error: 'Sign in failed' };
    }

    console.log('✅ User authenticated:', data.user.id);

    // Get user profile data with retry logic
    let profile = await this.getUserProfile(data.user.id);
    
    // If profile not found, wait a moment and try again (handles timing issues)
    if (!profile) {
      console.log('🔄 Profile not found immediately, retrying...');
      await new Promise(resolve => setTimeout(resolve, 500));
      profile = await this.getUserProfile(data.user.id);
    }

    // Still no profile? This is a problem - user should have a profile
    if (!profile) {
      console.error('❌ CRITICAL: No profile found for authenticated user:', data.user.id);
      // Let's try to create one as emergency fallback
      const emergencyName = data.user.user_metadata?.full_name || 
                           data.user.user_metadata?.name || 
                           credentials.email.split('@')[0];
      
      console.log('🚨 Attempting emergency profile creation...');
      const createResult = await this.createUserProfileSafely(
        data.user.id, 
        emergencyName, 
        data.user.email!
      );
      
      if (createResult.success) {
        profile = createResult.data;
        console.log('✅ Emergency profile created successfully');
      } else {
        console.error('❌ Emergency profile creation failed:', createResult.error);
      }
    }

    // Determine the display name with better fallback logic
    let displayName: string;
    
    if (profile?.full_name && profile.full_name.trim() !== '') {
      displayName = profile.full_name.trim();
      console.log('✅ Using profile name:', displayName);
    } else {
      // Fallback to email prefix, but clean it up
      displayName = credentials.email.split('@')[0];
      console.log('⚠️ Using email fallback name:', displayName);
      console.log('⚠️ Profile data:', JSON.stringify(profile, null, 2));
    }

    return { 
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: displayName,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at!,
      }, 
      error: null 
    };
  } catch (error: any) {
    console.log('❌ Signin exception:', error);
    return { user: null, error: error.message };
  }
}

  // Social authentication (Google, Facebook, Apple)
  async socialSignUp(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: undefined,
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: null, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Alternative method name for compatibility
  async socialLogin(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> {
    return this.socialSignUp(provider);
  }

  // Sign out user
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error: any) {
      console.error('Error getting session:', error.message);
      return null;
    }
  }

  // Get current user (FIXED VERSION)
async getCurrentUser(): Promise<User | null> {
  try {
    console.log('🔍 Getting current user...');
    
    const session = await this.getCurrentSession();
    if (!session?.user) {
      console.log('📭 No active session found');
      return null;
    }

    console.log('✅ Active session found for user:', session.user.id);
    
    const profile = await this.getUserProfile(session.user.id);
    
    // Better fallback logic that matches your signIn method
    let displayName: string;
    
    if (profile?.full_name && profile.full_name.trim() !== '') {
      displayName = profile.full_name.trim();
      console.log('✅ getCurrentUser using profile name:', displayName);
    } else {
      // Fallback to email prefix as last resort
      displayName = session.user.email?.split('@')[0] || 'User';
      console.log('⚠️ getCurrentUser using email fallback:', displayName);
      console.log('⚠️ getCurrentUser profile data:', JSON.stringify(profile, null, 2));
    }
    
    const user = {
      id: session.user.id,
      email: session.user.email!,
      name: displayName,
      created_at: session.user.created_at,
      updated_at: session.user.updated_at!,
    };
    
    console.log('👤 getCurrentUser returning:', JSON.stringify(user, null, 2));
    
    return user;
  } catch (error: any) {
    console.error('❌ Error getting current user:', error.message);
    return null;
  }
}

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? error.message : null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error: error ? error.message : null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: { full_name?: string; email?: string }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Create user profile with better error handling (NEW SAFER METHOD)
  private async createUserProfileSafely(userId: string, name: string, email: string): Promise<{success: boolean, error?: string, data?: any}> {
    try {
      console.log('🔄 Creating profile for user:', userId, name, email);
      
      // STEP 3.1: Check if profile already exists
      let existingProfile = await this.getUserProfile(userId);
      console.log('📋 Existing profile check:', existingProfile ? 'Found' : 'Not found');
      
      if (existingProfile) {
        console.log('✅ Profile already exists, using existing profile');
        return { success: true, data: existingProfile };
      }

      // STEP 3.2: Create profile using RPC function
      console.log('📝 Creating profile via secure function...');
      const { data, error } = await supabase
        .rpc('create_user_profile', {
          p_user_id: userId,
          p_email: email,
          p_full_name: name
        });

      if (error) {
        console.error('❌ Profile creation RPC error:', error);
        
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          console.log('🔄 Duplicate key detected, attempting to fetch existing profile...');
          
          // Wait a bit and try to fetch existing profile
          await new Promise(resolve => setTimeout(resolve, 300));
          existingProfile = await this.getUserProfile(userId);
          
          if (existingProfile) {
            console.log('✅ Successfully retrieved existing profile after duplicate error');
            return { success: true, data: existingProfile };
          } else {
            console.log('❌ Duplicate error but cannot fetch existing profile');
            return { success: false, error: 'Profile creation conflict - please try again' };
          }
        }
        
        return { success: false, error: error.message };
      }

      // STEP 3.3: Verify profile was created
      console.log('🔍 Verifying profile creation...');
      const verifyProfile = await this.getUserProfile(userId);
      
      if (verifyProfile) {
        console.log('✅ Profile verification: SUCCESS');
        return { success: true, data: verifyProfile };
      } else {
        console.log('❌ Profile verification: FAILED');
        return { success: false, error: 'Profile was created but verification failed' };
      }

    } catch (error: any) {
      console.error('❌ Exception during profile creation:', error);
      return { success: false, error: error.message };
    }
  }

  // Legacy method - keep for compatibility but now calls the safer method
  private async createUserProfile(userId: string, name: string, email: string) {
    const result = await this.createUserProfileSafely(userId, name, email);
    if (!result.success) {
      console.error('❌ Profile creation failed:', result.error);
    }
    return result.data;
  }

  // Get user profile (ENHANCED WITH DEBUG LOGS)
  private async getUserProfile(userId: string) {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📭 No profile found (PGRST116)');
        } else {
          console.error('❌ Profile fetch error:', error);
        }
        return null;
      }

      console.log('✅ Profile found:', data ? 'YES' : 'NO');
      return data;
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error);
      return null;
    }
  }

  // Handle social auth user creation
  async handleSocialAuthUser(user: any): Promise<User | null> {
    try {
      let profile = await this.getUserProfile(user.id);
      
      if (!profile) {
        const name = user.user_metadata?.name || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    'User';
        
        const result = await this.createUserProfileSafely(user.id, name, user.email);
        if (result.success) {
          profile = result.data;
        }
      }

      return {
        id: user.id,
        email: user.email!,
        name: profile?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        created_at: user.created_at,
        updated_at: user.updated_at!,
      };
    } catch (error) {
      console.error('Error handling social auth user:', error);
      return null;
    }
  }

  // Listen to auth state changes
// Listen to auth state changes (FIXED VERSION)
onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state change event:', event);
    
    if (session?.user) {
      console.log('👤 User session active, getting user data...');
      
      if (event === 'SIGNED_IN' && session.user.app_metadata?.provider !== 'email') {
        console.log('🌐 Social auth user detected');
        const user = await this.handleSocialAuthUser(session.user);
        console.log('👤 Social auth user result:', user);
        callback(user);
      } else {
        console.log('📧 Email auth user, getting current user...');
        const user = await this.getCurrentUser();
        console.log('👤 Email auth user result:', user);
        callback(user);
      }
    } else {
      console.log('📭 No user session, calling callback with null');
      callback(null);
    }
  });
}

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session?.user;
  }

  // DEBUG: Test table connection
  async testTableConnection(): Promise<void> {
    try {
      console.log('🧪 Testing table connection...');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Table connection failed:', error);
      } else {
        console.log('✅ Table connection successful. Row count:', data);
      }
    } catch (error) {
      console.error('❌ Exception testing table:', error);
    }
  }
}

export const authService = new AuthService();