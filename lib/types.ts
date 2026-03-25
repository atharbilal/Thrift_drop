export interface Drop {
  id: string;
  image_url: string;
  price: number;
  store_name: string;
  location: string;
  user_name: string;
  user_avatar?: string;
  store_badge?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDropInput {
  image_url: string;
  price: number;
  store_name: string;
  location: string;
  user_name: string;
  user_avatar?: string;
  store_badge?: string;
  description?: string;
}
