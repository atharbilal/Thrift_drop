import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

interface GlowBackgroundProps {
  children?: React.ReactNode;
}

const GlowBackground: React.FC<GlowBackgroundProps> = ({ children }) => {
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isConnectionSlow, setIsConnectionSlow] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type);
      setIsConnectionSlow(state.details?.isConnectionExpensive || false);
    });

    return unsubscribe;
  }, []);

  const shouldAnimate = connectionType === 'wifi' && !isConnectionSlow;

  if (connectionType === 'cellular' && isConnectionSlow) {
    // Static dark background for slow cellular
    return (
      <View style={styles.staticContainer}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* First gradient */}
      <MotiView
        style={styles.gradient1}
        animate={{
          translateX: shouldAnimate ? [0, width * 0.3, 0] : 0,
          translateY: shouldAnimate ? [0, -height * 0.2, 0] : 0,
        }}
        transition={{
          type: 'timing',
          duration: 8000,
          loop: true,
          repeatReverse: true,
        } as any}
      />
      
      {/* Second gradient */}
      <MotiView
        style={styles.gradient2}
        animate={{
          translateX: shouldAnimate ? [0, -width * 0.3, 0] : 0,
          translateY: shouldAnimate ? [0, height * 0.2, 0] : 0,
        }}
        transition={{
          type: 'timing',
          duration: 10000,
          loop: true,
          repeatReverse: true,
        } as any}
      />

      {/* Content overlay */}
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    position: 'relative',
    overflow: 'hidden',
  },
  staticContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient1: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    top: -height * 0.25,
    left: -width * 0.25,
    filter: 'blur(100px)',
  },
  gradient2: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    bottom: -height * 0.25,
    right: -width * 0.25,
    filter: 'blur(100px)',
  },
  contentOverlay: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});

export default GlowBackground;
