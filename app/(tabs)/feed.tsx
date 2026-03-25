import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

  // Render skeleton items while loading
  const renderLoadingItem = () => <SkeletonItem />;

  // List header component
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>Latest Drops</Text>
    </View>
  );

  // Key extractor for flash-list
  const keyExtractor = (item: Drop) => item.id;

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

  return (
    <GlowBackground>
      {/* Header with blur effect */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </BlurView>

      {/* Flash List for better performance */}
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
          <FlashList
            data={drops}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={200}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flashListContent}
            removeClippedSubviews={true}
            drawDistance={1000}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemType={(item) => 'drop'}
            onEndReached={() => {
              // Optional: Implement pagination
              __DEV__ && console.log('Reached end of list');
            }}
            onEndReachedThreshold={0.5}
          />
        </View>
      )}
    </GlowBackground>
  );

export default FeedScreen;
