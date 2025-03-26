
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calcular totais
  const deliveryFee = 3.99;
  const tax = totalPrice * 0.1;
  const orderTotal = totalPrice + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Por favor, forneça seu endereço de entrega");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Armazenar o endereço no localStorage para uso posterior
      localStorage.setItem("deliveryAddress", address);
      
      // Primeiro criar o pedido localmente
      const order = await placeOrder(items, address);
      
      // Limpar o carrinho após criar o pedido
      clearCart();
      
      // Redirecionar para a página de status do pedido
      navigate(`/order-status/${order.id}`);
      
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      setIsProcessing(false);
      toast.error("Houve um erro ao processar seu pedido. Por favor, tente novamente.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-medium mb-4">Informações de Entrega</h2>
            <div className="fancy-card p-6 mb-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="block text-sm font-medium mb-1">
                      Endereço de Entrega
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Digite seu endereço completo"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Finalizar Pedido (R$ ${orderTotal.toFixed(2)})`
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Ao prosseguir, seu pedido será finalizado e você poderá acompanhar o status da entrega.
                </p>
              </form>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-medium mb-4">Resumo do Pedido</h2>
            <div className="fancy-card p-6">
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">
                  {items.length} {items.length === 1 ? "Item" : "Itens"}
                </h3>
                
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.product.id} className="py-3 flex justify-between">
                      <div>
                        <span className="block font-medium">{item.product.name}</span>
                        <span className="text-sm text-gray-600">Qtd: {item.quantity}</span>
                      </div>
                      <span className="font-medium">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de Entrega</span>
                  <span className="font-medium">R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos</span>
                  <span className="font-medium">R$ {tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t my-3 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">R$ {orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <h3 className="font-medium mb-2">Informações de Entrega</h3>
              <p>Tempo estimado de entrega: 30-45 minutos após a confirmação do pedido</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
