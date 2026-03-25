import { supabase } from './supabase';
import { Drop, CreateDropInput } from './types';

export const dropsService = {
  // Get all drops, ordered by creation date (newest first)
  async getDrops(): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      __DEV__ && console.error('Error fetching drops:', error);
      throw error;
    }

    return data || [];
  },

  // Get a single drop by ID
  async getDropById(id: string): Promise<Drop | null> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      __DEV__ && console.error('Error fetching drop:', error);
      throw error;
    }

    return data;
  },

  // Create a new drop
  async createDrop(drop: CreateDropInput): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .insert([drop])
      .select()
      .single();

    if (error) {
      __DEV__ && console.error('Error creating drop:', error);
      throw error;
    }

    return data;
  },

  // Update a drop
  async updateDrop(id: string, updates: Partial<CreateDropInput>): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      __DEV__ && console.error('Error updating drop:', error);
      throw error;
    }

    return data;
  },

  // Delete a drop
  async deleteDrop(id: string): Promise<void> {
    const { error } = await supabase
      .from('drops')
      .delete()
      .eq('id', id);

    if (error) {
      __DEV__ && console.error('Error deleting drop:', error);
      throw error;
    }
  },

  // Get drops by store name
  async getDropsByStore(storeName: string): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('store_name', storeName)
      .order('created_at', { ascending: false });

    if (error) {
      __DEV__ && console.error('Error fetching drops by store:', error);
      throw error;
    }

    return data || [];
  },

  // Get drops by location
  async getDropsByLocation(location: string): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) {
      __DEV__ && console.error('Error fetching drops by location:', error);
      throw error;
    }

    return data || [];
  }
};
