import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

interface OfflineBannerProps {
  isVisible: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <MotiView
      from={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: -100, opacity: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
        easing: Easing.out(Easing.exp),
      }}
      style={styles.container}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={styles.content}>
          <View style={styles.signalContainer}>
            <View style={styles.signalDot} />
            <View style={styles.signalDot} />
            <View style={styles.signalDot} />
          </View>
          <Text style={styles.text}>Searching for signal...</Text>
        </View>
      </BlurView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  signalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff6b35',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Inter_500Medium',
  },
});

export default OfflineBanner;
