import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const handleUpdateQuantity = (productId: number, newQuantity: number, variantId?: number) => {
    if (newQuantity < 1) {
      removeItem(productId, variantId);
      toast.success("Item removido do carrinho");
    } else {
      updateQuantity(productId, newQuantity, variantId);
    }
  };

  const handleRemoveItem = (productId: number, variantId?: number) => {
    removeItem(productId, variantId);
    toast.success("Item removido do carrinho");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Adicione produtos ao carrinho para continuar comprando.
            </p>
            <Button size="lg" asChild>
              <Link href="/produtos">
                <a>Ver Produtos</a>
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Carrinho de Compras</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="bg-card border border-border rounded-lg p-4 flex gap-4"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-muted rounded flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground mb-2">{item.variantName}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-primary">
                        R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity - 1, item.variantId)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity + 1, item.variantId)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  clearCart();
                  toast.success("Carrinho limpo");
                }}
              >
                Limpar Carrinho
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>Calculado no checkout</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-3" asChild>
                  <Link href="/checkout">
                    <a>Finalizar Compra</a>
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/produtos">
                    <a>Continuar Comprando</a>
                  </Link>
                </Button>

                <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                  <p className="mb-2">✓ Compra 100% segura</p>
                  <p className="mb-2">✓ Frete para todo o Brasil</p>
                  <p>✓ Garantia de satisfação</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
