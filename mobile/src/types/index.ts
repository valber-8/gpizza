// Categories are derived from menu items — just unique strings
export type Category = string;

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'percent' | 'fixed' | 'free_item';
  value: number;
  min_order: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
  code: string;
}

export interface CartItem {
  item: MenuItem;
  qty: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type OrderType = 'delivery' | 'pickup';

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unit_price: number;
}

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  offer_code: string;
  total: number;
  status: OrderStatus;
  notes: string;
  delivery_address: string;
  order_type: OrderType;
  created_at: string;
  updated_at: string;
}

export interface PlaceOrderRequest {
  customer_name: string;
  phone: string;
  items: OrderItem[];
  order_type: OrderType;
  delivery_address?: string;
  offer_code?: string;
  notes?: string;
  redeem_points?: number;
}

export interface PlaceOrderResponse {
  order_id: string;
  customer_id: string;
  total: number;
  subtotal: number;
  discount: number;
  points_used: number;
  points_earned: number;
  estimated_minutes: number;
}

export interface LoyaltyInfo {
  customer_id: string;
  name: string;
  loyalty_points: number;
  next_reward_at: number;
}

export interface RedeemPointsResponse {
  discount: number;
  points_used: number;
  remaining: number;
}

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

export interface Customer {
  customer_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  total_orders: number;
  total_spent: number;
  first_order_at: string;
  last_order_at: string;
  notes: string;
}

export interface Review {
  review_id: string;
  customer_id: string;
  customer_name: string;
  order_id: string;
  rating: number;
  comment: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SubmitReviewRequest {
  customer_name: string;
  order_id: string;
  rating: number;
  comment?: string;
  customer_id?: string;
}

// Key-value map from the Settings tab
export type Settings = Record<string, string>;
