import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { BlurView } from 'expo-blur';
import GlowBackground from '@/components/GlowBackground';

export default function ProfileScreen() {
  return (
    <GlowBackground>
      {/* Header with blur effect */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </BlurView>

      {/* Profile content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <SymbolView
                name="person.fill"
                tintColor="#666666"
                size={48}
              />
            </View>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Drops</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <SymbolView
              name="bag.fill"
              tintColor="#ff6b35"
              size={24}
            />
            <Text style={styles.menuText}>My Drops</Text>
            <SymbolView
              name="chevron.right"
              tintColor="#666666"
              size={20}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <SymbolView
              name="heart.fill"
              tintColor="#ff6b35"
              size={24}
            />
            <Text style={styles.menuText}>Saved Items</Text>
            <SymbolView
              name="chevron.right"
              tintColor="#666666"
              size={20}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <SymbolView
              name="gearshape.fill"
              tintColor="#ff6b35"
              size={24}
            />
            <Text style={styles.menuText}>Settings</Text>
            <SymbolView
              name="chevron.right"
              tintColor="#666666"
              size={20}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <SymbolView
              name="questionmark.circle.fill"
              tintColor="#ff6b35"
              size={24}
            />
            <Text style={styles.menuText}>Help & Support</Text>
            <SymbolView
              name="chevron.right"
              tintColor="#666666"
              size={20}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GlowBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff6b35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  menuSection: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});
