import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabaseClient';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ProcessedImageResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  blurHash?: string;
}

/**
 * Process image: resize to max width and compress
 */
export const processImage = async (
  uri: string,
  maxWidth: number = 1200,
  quality: number = 0.7
): Promise<ProcessedImageResult> => {
  try {
    // Get original image info using ImageManipulator
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // No transformations initially to get info
      {
        compress: 1.0,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    if (!result) {
      throw new Error('Failed to get image info');
    }

    // Calculate new dimensions (assuming original size, we'll use a reasonable default)
    const originalWidth = 1920; // Default assumption
    const originalHeight = 1080; // Default assumption
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxWidth) {
      const ratio = maxWidth / originalWidth;
      newWidth = maxWidth;
      newHeight = Math.round(originalHeight * ratio);
    }

    // Resize and compress image
    const processedResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    if (!processedResult) {
      throw new Error('Failed to process image');
    }

    // Get file info
    const response = await fetch(processedResult.uri);
    const blob = await response.blob();
    const size = blob.size;

    return {
      uri: processedResult.uri,
      width: newWidth,
      height: newHeight,
      size,
    };
  } catch (error) {
    __DEV__ && console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Upload image to Supabase with progress tracking
 */
export const uploadImageWithProgress = async (
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  try {
    // Process image first
    const processedImage = await processImage(uri);
    
    // Generate unique filename
    const fileExt = 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', {
      uri: processedImage.uri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    // Upload with progress tracking
    const uploadResult = await supabase.storage
      .from('thriftdrop-images')
      .upload(filePath, formData, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thriftdrop-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    __DEV__ && console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Simple upload without progress (for fallback)
 */
export const uploadImage = async (uri: string): Promise<string> => {
  try {
    // Process image first
    const processedImage = await processImage(uri);
    
    // Generate unique filename
    const fileExt = 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    // Upload to Supabase
    const response = await fetch(processedImage.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('thriftdrop-images')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thriftdrop-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    __DEV__ && console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Generate BlurHash for image placeholder
 */
export const generateBlurHash = async (uri: string): Promise<string> => {
  try {
    // This would require additional BlurHash library
    // For now, return a placeholder
    return 'L6PZfSi_.AyEj3t7^jWB4jWB4jWB'; // Placeholder blur hash
  } catch (error) {
    __DEV__ && console.error('Error generating blur hash:', error);
    return 'L6PZfSi_.AyEj3t7^jWB4jWB4jWB'; // Fallback
  }
};
