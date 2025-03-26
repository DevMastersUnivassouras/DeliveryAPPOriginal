
import { CartItem } from "./cart";

export type OrderStatus = 
  | "processing" 
  | "preparing" 
  | "out_for_delivery" 
  | "delivered" 
  | "cancelled";

export type Order = {
  id: string;
  orderId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: string;
  createdAt: string;
  updatedAt: string;
};
