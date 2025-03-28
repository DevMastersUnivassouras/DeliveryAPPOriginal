import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcular totais
  const deliveryFee = 3.99;
  const tax = totalPrice * 0.1;
  const orderTotal = totalPrice + deliveryFee + tax;

  const handleCheckout = async () => {
    if (!address) {
      toast.error("Por favor, forneça seu endereço de entrega");
      return;
    }

    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:3000/api/pagar-me/checkout-redirect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: orderTotal,
          items: items,
          customer: {
            id: user?.id || "guest",
            name: user?.name || "Cliente Convidado",
            email: user?.email || "guest@example.com",
            cpf: "00000000000", // Em produção, solicite ao usuário
            state: "SP", // Em produção, solicite ao usuário
            city: "São Paulo", // Em produção, solicite ao usuário
            street: address.split(',')[0] || "Endereço não especificado",
            number: address.split(',')[1] || "S/N",
            zipcode: "00000000" // Em produção, solicite ao usuário
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao iniciar pagamento");
      }

      const data = await response.json();
      
      // Redireciona para a página de pagamento externa
      window.location.href = data.payment_url;

    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
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
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Rua, Número, Bairro, Cidade - Estado"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full mt-6"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecionando para pagamento...
                      </>
                    ) : (
                      `Pagar R$ ${orderTotal.toFixed(2)}`
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Você será redirecionado para um ambiente seguro de pagamento
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-4">Resumo do Pedido</h2>
            <div className="fancy-card p-6">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t my-2"></div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos</span>
                  <span>R$ {tax.toFixed(2)}</span>
                </div>
                <div className="border-t my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;