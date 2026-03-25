import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Tabs, useRouter } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff6b35',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#1a1a1a',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: Platform.OS === 'ios' ? () => (
          <BlurView 
            intensity={100} 
            tint="dark" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0 
            }} 
          />
        ) : undefined,
        tabBarHideOnKeyboard: true,
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#1a1a1a',
        },
        headerBackground: Platform.OS === 'ios' ? () => (
          <BlurView 
            intensity={100} 
            tint="dark" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0 
            }} 
          />
        ) : undefined,
        headerTintColor: '#ffffff',
        headerTransparent: true,
      }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="house.fill"
              tintColor={color}
              size={24}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="plus.circle.fill"
              tintColor={color}
              size={24}
            />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Open modal instead
            router.push('/modal');
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="person.fill"
              tintColor={color}
              size={24}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
