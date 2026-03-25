import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          price: number;
          category: string;
          image_url: string | null;
          lat_lng: string | null; // Stored as 'lat,lng' string
          user_id: string;
          status: 'active' | 'sold' | 'removed';
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          price: number;
          category: string;
          image_url?: string | null;
          lat_lng?: string | null;
          user_id: string;
          status?: 'active' | 'sold' | 'removed';
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string | null;
          lat_lng?: string | null;
          user_id?: string;
          status?: 'active' | 'sold' | 'removed';
        };
      };
    };
  };
};
