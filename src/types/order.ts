import { Product } from "./product";


export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'processing' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[]; 
  total: number;
  status: OrderStatus;
  address: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  userId?: string;
}