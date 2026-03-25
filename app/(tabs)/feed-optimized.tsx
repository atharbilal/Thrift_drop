import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import DropCard from '@/components/DropCard';
import GlowBackground from '@/components/GlowBackground';
import { dropsService } from '@/lib/dropsService';
import { Drop } from '@/lib/types';

const FeedScreen = () => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDrops = await dropsService.getDrops();
      setDrops(fetchedDrops);
    } catch (err) {
      setError('Failed to load drops');
      __DEV__ && console.error('Error fetching drops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized render item for performance
  const renderItem = useMemo(() => ({ item }: { item: Drop }) => (
    <DropCard 
      userName={item.user_name}
      userAvatar={item.user_avatar || ''}
      storeName={item.store_name}
      storeBadge={item.store_badge || 'Bargain Store'}
      itemImage={item.image_url}
      price={`$${item.price}`}
      description={item.description || ''}
    />
  ), []);

  // Skeleton loader component
  const SkeletonItem = () => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: [0, 1, 0], translateY: [10, 0, 10] }}
      transition={{
        type: 'timing',
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        loop: true,
      }}
      style={styles.skeletonItem}
    >
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
          <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
        </View>
      </View>
    </MotiView>
  );

  // List header component
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>Latest Drops</Text>
    </View>
  );

  // Key extractor for flat list
  const keyExtractor = (item: Drop) => item.id;

  return (
    <GlowBackground>
      {/* Header with blur effect */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </BlurView>

      {/* Optimized Flat List with skeleton loader */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <SkeletonItem key={index} />
            ))}
          </View>
          <ActivityIndicator size="large" color="#ff6b35" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading drops...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : drops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No drops found</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={drops}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * index,
              index,
            })}
            onEndReached={() => {
              __DEV__ && console.log('Reached end of list');
            }}
            onEndReachedThreshold={0.5}
          />
        </View>
      )}
    </GlowBackground>
  );
};

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
    fontFamily: 'Inter_700Bold',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  skeletonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  skeletonItem: {
    marginBottom: 16,
  },
  skeletonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  skeletonLineShort: {
    width: '60%',
  },
  skeletonLineMedium: {
    width: '80%',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b35',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#a0a0a0',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});

export default FeedScreen;
