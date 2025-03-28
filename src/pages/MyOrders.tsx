
import { Link } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "preparing":
      return <Package className="h-5 w-5 text-orange-500" />;
    case "out_for_delivery":
      return <ShoppingCart className="h-5 w-5 text-purple-500" />;
    case "delivered":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "processing":
      return "Processando";
    case "preparing":
      return "Em Preparo";
    case "out_for_delivery":
      return "Em Entrega";
    case "delivered":
      return "Entregue";
    default:
      return "Desconhecido";
  }
};

const MyOrders = () => {
  const { orders } = useOrders();

  // Ordenar pedidos por data (mais recentes primeiro)
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center text-primary mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para Início
      </Link>
      
      <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>
      
      {sortedOrders.length === 0 ? (
        <div className="fancy-card p-12 text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-medium mb-2">Nenhum Pedido Ainda</h2>
          <p className="text-gray-600 mb-6">
            Você ainda não fez nenhum pedido. Comece a pedir comida agora!
          </p>
          <Button asChild>
            <Link to="/">Explorar Cardápio</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedOrders.map((order) => {
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString();
            const formattedTime = orderDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            
            return (
              <Link
                key={order.id}
                to={`/order-status/${order.id}`}
                className="block fancy-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="font-medium">Pedido #{order.orderId}</h3>
                      <p className="text-sm text-gray-600">
                        {formattedDate} às {formattedTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <span className="block font-medium">R$ {order.total.toFixed(2)}</span>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "delivered" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <span className="block mb-1">Itens:</span>
                    <ul>
                      {order.items.slice(0, 2).map((item) => (
                        <li key={item.product.id} className="inline-block mr-4">
                          {item.quantity}x {item.product.name}
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li className="inline-block text-primary">
                          +{order.items.length - 2} mais
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
