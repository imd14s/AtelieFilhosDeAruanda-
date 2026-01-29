import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { ShoppingCart, Sparkles, Package, Truck, Shield, Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductDetail() {
  const [, params] = useRoute("/produto/:slug");
  const slug = params?.slug || "";

  const { data: productData, isLoading } = trpc.products.getBySlug.useQuery({ slug });
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const addToCartMutation = trpc.cart.add.useMutation();

  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="w-full aspect-square" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
            <Button asChild>
              <Link href="/produtos">
                <a>Ver Todos os Produtos</a>
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { variants } = productData;
  const selectedVariant = selectedVariantId 
    ? variants.find(v => v.id === selectedVariantId) 
    : null;

  const finalPrice = selectedVariant
    ? parseFloat(productData.basePrice) + parseFloat(selectedVariant.priceAdjustment)
    : parseFloat(productData.basePrice);

  const stockQuantity = selectedVariant?.stockQuantity || 0;
  const hasStock = variants.length === 0 || (selectedVariant && stockQuantity > 0);

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariantId) {
      toast.error("Por favor, selecione uma variante");
      return;
    }

    if (!hasStock) {
      toast.error("Produto fora de estoque");
      return;
    }

    // Add to local cart
    addItem({
      productId: productData.id,
      variantId: selectedVariantId,
      quantity,
      name: productData.name,
      price: finalPrice,
      variantName: selectedVariant?.name,
    });

    // If authenticated, sync with server
    if (isAuthenticated && user) {
      try {
        await addToCartMutation.mutateAsync({
          productId: productData.id,
          variantId: selectedVariantId,
          quantity,
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }

    toast.success("Produto adicionado ao carrinho!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link href="/">
              <a className="hover:text-primary">Início</a>
            </Link>
            {" / "}
            <Link href="/produtos">
              <a className="hover:text-primary">Produtos</a>
            </Link>
            {" / "}
            <span className="text-foreground">{productData.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {productData.images.length > 0 ? (
                  <img
                    src={productData.images[0].imageUrl}
                    alt={productData.images[0].altText || productData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Sparkles className="h-24 w-24" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {productData.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productData.images.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square bg-muted rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altText || productData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                {productData.featured && (
                  <Badge variant="secondary" className="mb-2">
                    Destaque
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {productData.name}
                </h1>
                <div className="text-4xl font-bold text-primary mb-4">
                  R$ {finalPrice.toFixed(2)}
                </div>
                {productData.shortDescription && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {productData.shortDescription}
                  </p>
                )}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Selecione uma opção:
                  </label>
                  <Select
                    value={selectedVariantId?.toString()}
                    onValueChange={(value) => setSelectedVariantId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha tamanho/cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id.toString()}>
                          {variant.name} - {variant.stockQuantity > 0 ? `${variant.stockQuantity} em estoque` : 'Esgotado'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Quantidade:</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant ? quantity >= stockQuantity : false}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stock Status */}
              {variants.length > 0 && selectedVariant && (
                <div className="mb-6">
                  {stockQuantity > 0 ? (
                    <Badge variant="default" className="bg-green-500">
                      {stockQuantity} unidades disponíveis
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Fora de estoque</Badge>
                  )}
                </div>
              )}

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full mb-6"
                onClick={handleAddToCart}
                disabled={!hasStock || addToCartMutation.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {hasStock ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}
              </Button>

              {/* Features */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Artesanato Autêntico</h4>
                    <p className="text-sm text-muted-foreground">
                      Peça única, feita à mão com materiais de qualidade.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Entrega para Todo Brasil</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviamos com segurança e rastreamento completo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Compra Segura</h4>
                    <p className="text-sm text-muted-foreground">
                      Pagamento protegido e garantia de satisfação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {productData.description && (
            <div className="mt-12 border-t border-border pt-12">
              <h2 className="text-2xl font-bold mb-6">Descrição do Produto</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="whitespace-pre-line">{productData.description}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
