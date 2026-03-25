import { useState, useEffect, useCallback } from 'react';
import { supabase, Database } from '@/lib/supabaseClient';
import { ListingsCache } from '@/lib/cache';
import { useNetwork } from './useNetwork';

type Listing = Database['public']['Tables']['listings']['Row'];

interface UseListingsOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  userId?: string;
  status?: 'active' | 'sold' | 'removed';
  limit?: number;
}

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  createListing: (listing: Omit<Listing, 'id' | 'created_at'>) => Promise<Listing | null>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<Listing | null>;
  deleteListing: (id: string) => Promise<boolean>;
}

export const useListings = (options: UseListingsOptions = {}): UseListingsReturn => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetwork();

  const fetchListings = async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first if online and cache is enabled
      if (useCache && isOnline) {
        const cachedListings = await ListingsCache.get();
        if (cachedListings) {
          setListings(cachedListings);
          setLoading(false);
        }
      }

      // If offline, try to use cache only
      if (!isOnline) {
        const cachedListings = await ListingsCache.get();
        if (cachedListings) {
          setListings(cachedListings);
          setLoading(false);
          return;
        } else {
          throw new Error('No internet connection and no cached data available');
        }
      }

      // Fetch fresh data from Supabase
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.category) {
        query = query.eq('category', options.category);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        // Default to active listings if no status specified
        query = query.eq('status', 'active');
      }
      
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      
      if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }
      
      if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Update state and cache
      const freshListings = data || [];
      setListings(freshListings);
      
      // Cache the fresh data
      await ListingsCache.set(freshListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      __DEV__ && console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    if (!isOnline) {
      setError('Cannot refresh while offline');
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      // Fetch fresh data from Supabase
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.category) {
        query = query.eq('category', options.category);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        query = query.eq('status', 'active');
      }
      
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      
      if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }
      
      if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Update state and cache
      const freshListings = data || [];
      setListings(freshListings);
      
      // Cache the fresh data
      await ListingsCache.set(freshListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh listings');
      __DEV__ && console.error('Error refreshing listings:', err);
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, options]);

  const createListing = async (listing: Omit<Listing, 'id' | 'created_at'>): Promise<Listing | null> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert(listing)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setListings(prev => [data, ...prev]);
      
      // Update cache
      await ListingsCache.set([data, ...listings]);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create listing';
      setError(errorMessage);
      __DEV__ && console.error('Error creating listing:', err);
      return null;
    }
  };

  const updateListing = async (id: string, updates: Partial<Listing>): Promise<Listing | null> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      const updatedListings = listings.map(listing => 
        listing.id === id ? { ...listing, ...data } : listing
      );
      setListings(updatedListings);
      
      // Update cache
      await ListingsCache.set(updatedListings);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update listing';
      setError(errorMessage);
      __DEV__ && console.error('Error updating listing:', err);
      return null;
    }
  };

  const deleteListing = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove from local state
      const updatedListings = listings.filter(listing => listing.id !== id);
      setListings(updatedListings);
      
      // Update cache
      await ListingsCache.set(updatedListings);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete listing';
      setError(errorMessage);
      __DEV__ && console.error('Error deleting listing:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchListings();
  }, [options.category, options.minPrice, options.maxPrice, options.userId, options.status, options.limit]);

  return {
    listings,
    loading,
    refreshing,
    error,
    refetch: fetchListings,
    refresh,
    createListing,
    updateListing,
    deleteListing,
  };
};

// Helper hook for real-time subscriptions
export const useListingsRealtime = (options: UseListingsOptions = {}) => {
  const { listings, loading, refreshing, error, refetch, refresh, createListing, updateListing, deleteListing } = useListings(options);

  useEffect(() => {
    const channel = supabase
      .channel('listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
        },
        (payload) => {
          __DEV__ && console.log('Real-time change:', payload);
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return {
    listings,
    loading,
    refreshing,
    error,
    refetch,
    refresh,
    createListing,
    updateListing,
    deleteListing,
  };
};
