import { useOutletContext, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { ShoppingBag, Check, Loader2, Heart } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product, initialIsFavorite = false }) => {
  const { user } = useOutletContext() || {};
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Faça login para favoritar produtos.");
      return;
    }

    setFavLoading(true);
    try {
      const newState = await storeService.favorites.toggle(user.id, product.id);
      setIsFavorite(newState);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      storeService.cart.add(product, 1);
      setAdded(true);
      setLoading(false);
      setTimeout(() => setAdded(false), 2000);
    }, 300);
  };

  const isOutOfStock = product.stockQuantity <= 0;
  const imageUrl = getImageUrl(product.images?.[0]);

  // Calculate discount
  const originalPrice = product.originalPrice || product.price;
  const currentPrice = product.price;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = product.discountPercentage || (hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0);

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(currentPrice || 0);

  const originalPriceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(originalPrice || 0);

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-sm border border-gray-100 max-w-[280px] mx-auto w-full">
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Ícone de Favorito */}
      <button
        onClick={handleToggleFavorite}
        disabled={favLoading}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${isFavorite
          ? 'bg-white text-red-500 hover:bg-gray-50'
          : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {favLoading ? (
          <Loader2 size={14} className="animate-spin text-gray-300" />
        ) : (
          <Heart size={16} className={isFavorite ? "fill-current" : ""} />
        )}
      </button>

      <Link to={`/produto/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.title || product.name}
          onError={(e) => { e.target.src = '/images/default.png'; }}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[var(--azul-profundo)] text-white text-[10px] px-3 py-1 uppercase tracking-widest">Esgotado</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link to={`/produto/${product.id}`} className="mb-2">
          <h3
            className="font-playfair text-sm leading-tight text-[var(--azul-profundo)] line-clamp-2 min-h-[2.5rem] hover:text-[var(--dourado-suave)] transition-colors"
            title={product.title || product.name}
          >
            {product.title || product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex flex-col mb-3">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">
                {originalPriceFormatted}
              </span>
            )}
            <span className="font-lato text-base font-bold text-[var(--azul-profundo)]">
              {priceFormatted}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 font-lato text-[10px] uppercase tracking-wider transition-all duration-300 rounded-sm ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : added
                ? 'bg-green-700 text-white'
                : 'bg-[var(--azul-profundo)] text-white hover:bg-[var(--dourado-suave)]'
              }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : added ? (
              <><Check size={14} /> Na Sacola</>
            ) : isOutOfStock ? (
              'Indisponível'
            ) : (
              <><ShoppingBag size={14} /> Comprar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
