import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SymbolView } from 'expo-symbols';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { signIn, signUp, onAuthStateChange, signInWithOAuth } from '@/lib/auth';
import GlowBackground from '@/components/GlowBackground';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Google OAuth configuration
const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/callback`;

interface AuthData {
  email: string;
  password: string;
}

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        // User is authenticated, redirect to feed
        router.replace('/(tabs)/feed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Use the new signInWithOAuth function
      const result = await signInWithOAuth('google');

      if (!result.success) {
        throw new Error(result.error || 'Google sign-in failed');
      }

      // The OAuth flow will handle the redirect automatically
      // The auth state change listener will handle the success case
      
    } catch (error) {
      __DEV__ && console.error('Google sign-in error:', error);
      Alert.alert(
        'Sign-In Error',
        'Failed to sign in with Google. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };


  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Validate input
      if (!authData.email.trim() || !authData.password.trim()) {
        Alert.alert('Missing Information', 'Please enter both email and password.');
        return;
      }

      const result = isSignUp 
        ? await signUp(authData.email, authData.password)
        : await signIn(authData.email, authData.password);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // For sign up, show success message
        if (isSignUp) {
          Alert.alert(
            'Account Created!',
            'Your account has been created successfully.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/feed'),
              }
            ]
          );
        } else {
          // For sign in, redirect will happen automatically via auth state change
          router.replace('/(tabs)/feed');
        }
      } else {
        Alert.alert(
          isSignUp ? 'Sign Up Error' : 'Sign In Error',
          result.error || 'An unexpected error occurred.'
        );
      }
    } catch (error) {
      __DEV__ && console.error('Email auth error:', error);
      Alert.alert(
        'Authentication Error',
        'Failed to authenticate. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setAuthData({ email: '', password: '' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <GlowBackground>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <SymbolView
                name="chevron.left"
                tintColor="#ffffff"
                size={24}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </BlurView>

        <View style={styles.content}>
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <SymbolView
                name="bag.fill"
                tintColor="#ff6b35"
                size={48}
              />
            </View>
            <Text style={styles.brandName}>ThriftDrop</Text>
            <Text style={styles.brandTagline}>
              {isSignUp 
                ? 'Join the marketplace for amazing finds'
                : 'Welcome back to your marketplace'
              }
            </Text>
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Email/Password Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={authData.email}
                onChangeText={(text) => setAuthData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={authData.password}
                onChangeText={(text) => setAuthData(prev => ({ ...prev, password: text }))}
                placeholder="Enter your password"
                placeholderTextColor="#666666"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.authButton, styles.emailButton, loading && styles.disabledButton]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle Auth Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.toggleLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  emailButton: {
    backgroundColor: '#ff6b35',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#666666',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff6b35',
  },
});
