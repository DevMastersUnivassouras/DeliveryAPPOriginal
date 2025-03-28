import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { Product } from '@/types/product';

// Definindo os tipos necessários
interface CartItem {
  product: Product;
  quantity: number;
}

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type OrderStatus = 'processing' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: PaymentStatus;
  userId?: string;
}

type OrderContextType = {
  orders: Order[];
  placeOrder: (items: CartItem[], address: string) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  clearUserOrders: () => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  const getOrdersKey = () => `orders_${user?.id || 'guest'}`;

  // Carrega pedidos do localStorage
  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem(getOrdersKey());
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);
          setOrders(parsedOrders);
        } catch (e) {
          console.error('Failed to parse orders from localStorage', e);
          localStorage.removeItem(getOrdersKey());
        }
      }
    };
    
    loadOrders();
  }, [user?.id]);

  // Salva pedidos no localStorage
  useEffect(() => {
    localStorage.setItem(getOrdersKey(), JSON.stringify(orders));
  }, [orders, user?.id]);

  const placeOrder = async (items: CartItem[], address: string): Promise<Order> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        const newOrder: Order = {
          id: Math.random().toString(36).substring(2, 9),
          items,
          total,
          status: 'processing',
          address,
          orderId: `ORD-${Date.now().toString().substring(8)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paymentStatus: 'pending',
          userId: user?.id
        };

        setOrders(prevOrders => [newOrder, ...prevOrders]);
        toast.success('Pedido realizado com sucesso!');
        resolve(newOrder);
      }, 1000);
    });
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === id) {
          const updatedOrder = {
            ...order,
            status,
            updatedAt: new Date().toISOString(),
          };
          return updatedOrder;
        }
        return order;
      })
    );

    const statusMessages = {
      processing: 'Processando',
      preparing: 'Em Preparo',
      out_for_delivery: 'Em Entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };

    toast.success(`Status do pedido atualizado para ${statusMessages[status]}`);
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === id) {
          const updatedOrder = {
            ...order,
            paymentStatus: status,
            updatedAt: new Date().toISOString(),
          };
          return updatedOrder;
        }
        return order;
      })
    );

    const paymentMessages = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhou',
      refunded: 'Reembolsado'
    };

    toast.success(`Status de pagamento atualizado para ${paymentMessages[status]}`);
  };

  const clearUserOrders = () => {
    setOrders([]);
    localStorage.removeItem(getOrdersKey());
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        getOrderById,
        updateOrderStatus,
        updatePaymentStatus,
        clearUserOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};