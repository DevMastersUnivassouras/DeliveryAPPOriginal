
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Check, Clock } from "lucide-react";

const orderSteps = [
  { id: "processing", label: "Pedido Recebido", icon: Check },
  { id: "preparing", label: "Em Preparo", icon: Check },
  { id: "out_for_delivery", label: "Saiu para Entrega", icon: Check },
  { id: "delivered", label: "Entregue", icon: Check },
];

const OrderStatus = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (orderId) {
      // Verificar se veio do Stripe (formato: success-timestamp)
      if (orderId.startsWith('success-')) {
        // Simular criação de pedido após pagamento bem-sucedido no Stripe
        const address = localStorage.getItem("deliveryAddress") || "Endereço não especificado";
        
        // Aqui, em uma aplicação real, você verificaria o status do pagamento no Stripe
        // e criaria um pedido no banco de dados
        console.log("Sucesso no pagamento via Stripe! Criando pedido...");
        
        // Por enquanto, apenas remover o endereço do localStorage
        localStorage.removeItem("deliveryAddress");
      }
      
      const fetchedOrder = getOrderById(orderId);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        
        // Set current step based on order status
        switch (fetchedOrder.status) {
          case "processing":
            setCurrentStep(0);
            break;
          case "preparing":
            setCurrentStep(1);
            break;
          case "out_for_delivery":
            setCurrentStep(2);
            break;
          case "delivered":
            setCurrentStep(3);
            break;
          default:
            setCurrentStep(0);
        }
      }
    }
  }, [orderId, getOrderById]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Carregando status do pedido...</div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/my-orders" className="inline-flex items-center text-primary mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para Meus Pedidos
      </Link>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Status do Pedido</h1>
          <span className="text-gray-600 text-sm">{formattedDate}</span>
        </div>
        
        <div className="fancy-card p-6 mb-8">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <span className="block text-sm text-gray-600">Número do Pedido</span>
              <span className="font-medium">{order.orderId}</span>
            </div>
            <div className="text-right">
              <span className="block text-sm text-gray-600">Valor Total</span>
              <span className="font-bold">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="relative">
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200"></div>
              <div 
                className="absolute left-0 top-1/2 h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {orderSteps.map((step, index) => {
                  const isActive = index <= currentStep;
                  const isPending = index === currentStep + 1;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all relative ${
                          isActive 
                            ? "bg-primary text-white" 
                            : isPending 
                              ? "bg-white border-2 border-primary text-primary" 
                              : "bg-white border-2 border-gray-200 text-gray-400"
                        }`}
                      >
                        {isActive ? (
                          <Check className="h-5 w-5" />
                        ) : isPending ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                        )}
                        
                        {isActive && index === currentStep && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                          </span>
                        )}
                      </div>
                      <span 
                        className={`mt-2 text-xs text-center block w-20 ${
                          isActive ? "font-medium text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="font-medium mb-1">
                {currentStep === 0 && "Seu pedido foi recebido! Estamos processando agora."}
                {currentStep === 1 && "Sua comida está sendo preparada! Não vai demorar."}
                {currentStep === 2 && "Sua comida está a caminho! Prepare-se para saborear."}
                {currentStep === 3 && "Seu pedido foi entregue! Bom apetite!"}
              </h3>
              <p className="text-sm text-gray-600">
                {currentStep < 3 && "Entrega estimada: 30-45 minutos a partir do horário do pedido"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="fancy-card p-6">
          <h2 className="font-bold mb-4">Detalhes do Pedido</h2>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.product.id} className="py-3 flex justify-between">
                <div>
                  <span className="block font-medium">
                    {item.quantity}x {item.product.name}
                  </span>
                </div>
                <span className="font-medium">
                  R$ {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          
          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              <span>Endereço de Entrega: {order.address}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar para Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
