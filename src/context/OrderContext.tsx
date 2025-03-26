
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { CartItem } from "@/types/cart";
import { Order, OrderStatus } from "@/types/order";

type OrderContextType = {
  orders: Order[];
  placeOrder: (items: CartItem[], address: string) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock data
let MOCK_ORDERS: Order[] = [];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on initial load
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      try {
        MOCK_ORDERS = JSON.parse(savedOrders);
        setOrders(MOCK_ORDERS);
      } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
      }
    }
  }, []);

  // Save orders to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
    MOCK_ORDERS = orders;
  }, [orders]);

  const placeOrder = async (items: CartItem[], address: string): Promise<Order> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items,
      total,
      status: "processing",
      address,
      orderId: `ORD-${Date.now().toString().substring(8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: "pending", // Adicionando status de pagamento
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    toast.success("Pedido realizado com sucesso!");
    return newOrder;
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === id) {
          return {
            ...order,
            status,
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );
    toast.success(`Status do pedido atualizado para ${status === "processing" ? "Processando" : 
                   status === "preparing" ? "Em Preparo" : 
                   status === "out_for_delivery" ? "Em Entrega" : 
                   status === "delivered" ? "Entregue" : "Cancelado"}`);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        getOrderById,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
