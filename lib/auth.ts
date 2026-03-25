import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Profile {
  id?: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  created_at?: string;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      __DEV__ && console.error('Error getting current user:', error);
      return null;
    }
    
    return user ? {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    } : null;
  } catch (error) {
    __DEV__ && console.error('Unexpected error getting current user:', error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      __DEV__ && console.error('Error getting current session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    __DEV__ && console.error('Unexpected error getting session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get user ID for database operations
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Create or update user profile
 */
export async function createOrUpdateProfile(user: User): Promise<Profile | null> {
  try {
    const profileData = {
      user_id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    };

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        __DEV__ && console.error('Error updating profile:', error);
        return null;
      }

      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        __DEV__ && console.error('Error creating profile:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    __DEV__ && console.error('Unexpected error creating/updating profile:', error);
    return null;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      __DEV__ && console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    __DEV__ && console.error('Unexpected error getting user profile:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Create/update profile after successful sign in
    if (data.user) {
      await createOrUpdateProfile(data.user);
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Profile will be created automatically by the database trigger
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
  try {
    const redirectTo = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      __DEV__ && console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email,
      user_metadata: session.user.user_metadata,
    } : null;
    
    // Create/update profile when user signs in
    if (user && event === 'SIGNED_IN') {
      await createOrUpdateProfile(user);
    }
    
    callback(user);
  });
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
