import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

interface DropCardProps {
  userName: string;
  userAvatar: string;
  storeName: string;
  storeBadge: string;
  itemImage: string;
  price: string;
  description: string;
}

const DropCard: React.FC<DropCardProps> = ({
  userName,
  userAvatar,
  storeName,
  storeBadge,
  itemImage,
  price,
  description,
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <Image 
          source={{ uri: userAvatar }} 
          style={styles.userAvatar}
          placeholder="L6PZfSi_.AyEj3t7^jWB4jWB4jWB"
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.storeName}>{storeName}</Text>
        </View>
      </View>

      {/* Store Info Box with Badge */}
      <View style={styles.storeInfo}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{storeBadge}</Text>
        </View>
      </View>

      {/* Main Item Image */}
      <Image 
        source={{ uri: itemImage }} 
        style={styles.itemImage}
        placeholder="L6PZfSi_.AyEj3t7^jWB4jWB4jWB"
        contentFit="cover"
        transition={500}
        cachePolicy="memory-disk"
      />

      {/* Price and Description */}
      <View style={styles.footer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  storeName: {
    fontSize: 14,
    color: '#a0a0a0',
    fontFamily: 'Inter_400Regular',
  },
  storeInfo: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  badgeContainer: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
  itemImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#0a0a0a',
  },
  footer: {
    padding: 16,
    paddingTop: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#a0a0a0',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});

export default DropCard;
