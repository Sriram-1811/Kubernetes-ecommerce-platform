export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  currency: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: number;
  order_id: number;
  type: string;
  status: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
