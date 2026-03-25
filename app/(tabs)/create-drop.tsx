import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { getUserId, isAuthenticated } from '@/lib/auth';
import { uploadImageWithProgress, UploadProgress } from '@/lib/imageUtils';
import GlowBackground from '@/components/GlowBackground';

interface FormData {
  title: string;
  price: string;
  description: string;
  category: string;
}

const CATEGORIES = [
  'electronics',
  'clothing', 
  'furniture',
  'books',
  'toys',
  'sports',
  'home',
  'beauty',
  'automotive',
  'other'
];

export default function CreateDrop() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    price: '',
    description: '',
    category: 'other'
  });

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      const authenticated = await isAuthenticated();
      
      if (!authenticated) {
        Alert.alert(
          'Authentication Required',
          'Please sign in to create a drop.',
          [
            {
              text: 'Cancel',
              onPress: () => router.back(),
              style: 'cancel',
            },
            {
              text: 'Sign In',
              onPress: () => router.push('/modal'),
            },
          ]
        );
        return;
      }

      const currentUserId = await getUserId();
      if (currentUserId) {
        setUserId(currentUserId);
      }
    } catch (error) {
      __DEV__ && console.error('Authentication check failed:', error);
      Alert.alert('Error', 'Failed to verify authentication. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const imageUrl = await uploadImageWithProgress(uri, (progress) => {
        setUploadProgress(progress);
      });
      return imageUrl;
    } catch (error) {
      __DEV__ && console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Check authentication first
    if (!userId) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to create a drop.'
      );
      return;
    }

    // Validate form
    if (!formData.title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your drop.');
      return;
    }

    if (!formData.price.trim()) {
      Alert.alert('Required Field', 'Please enter a price for your drop.');
      return;
    }

    if (!image) {
      Alert.alert('Required Field', 'Please select an image for your drop.');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(null);

      // Upload image first
      const imageUrl = await uploadImage(image);
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // Create drop in database
      const { error } = await supabase
        .from('listings')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: imageUrl,
          user_id: userId,
          status: 'active',
        });

      if (error) {
        throw error;
      }

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Success!',
        'Your drop has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      __DEV__ && console.error('Error creating drop:', error);
      Alert.alert(
        'Error',
        'Failed to create drop. Please try again.'
      );
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <GlowBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </GlowBackground>
    );
  }

  return (
    <GlowBackground>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <SymbolView
                name="chevron.left"
                tintColor="#ffffff"
                size={24}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Drop</Text>
            <View style={styles.placeholder} />
          </View>
        </BlurView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Upload Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Add Photo</Text>
            <View style={styles.imageContainer}>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={pickImage}
                  >
                    <SymbolView
                      name="camera.fill"
                      tintColor="#ffffff"
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <SymbolView
                    name="photo.badge.plus"
                    tintColor="#666666"
                    size={48}
                  />
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
            </View>
            
            {!image && (
              <View style={styles.imageButtonRow}>
                <TouchableOpacity 
                  style={[styles.imageButton, styles.primaryButton]}
                  onPress={takePhoto}
                >
                  <SymbolView
                    name="camera.fill"
                    tintColor="#ffffff"
                    size={20}
                  />
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.imageButton, styles.secondaryButton]}
                  onPress={pickImage}
                >
                  <SymbolView
                    name="photo"
                    tintColor="#ff6b35"
                    size={20}
                  />
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="What are you selling?"
                placeholderTextColor="#666666"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.categoryChipActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        formData.category === category && styles.categoryTextActive
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your item..."
                placeholderTextColor="#666666"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
          </View>

          {/* Upload Progress Bar */}
          {uploadProgress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Uploading... {Math.round(uploadProgress.percentage)}%
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <SymbolView
                  name="plus.circle.fill"
                  tintColor="#ffffff"
                  size={20}
                />
                <Text style={styles.submitButtonText}>Post Drop</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  },
  imageSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  imageContainer: {
    marginBottom: 15,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  imageButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#ff6b35',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryChipActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  categoryText: {
    fontSize: 14,
    color: '#ffffff',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  progressContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 3,
  },
});
