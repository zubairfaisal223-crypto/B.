import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  Filter,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { StoreSettingsProvider, useStoreSettings } from './context/StoreSettingsContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomOrderModal } from './components/CustomOrderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { PolicyModal } from './components/PolicyModal';
import { Footer } from './components/Footer';
import { Product, Category, Review, Order } from './types';
import { formatPKR } from './utils/pricing';

function MainStorefront() {
  const { user, isAdmin } = useAuth();
  const { isCartOpen, setIsCartOpen } = useCart();
  const { settings } = useStoreSettings();

  // Navigation & View state
  const [currentView, setCurrentView] = useState<'home' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductType, setSelectedProductType] = useState<'all' | 'ready-made' | 'made-to-order'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCheckoutCoupon, setAppliedCheckoutCoupon] = useState<{ code: string; discount: number } | undefined>();
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activePolicyKey, setActivePolicyKey] = useState<string | null>(null);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedProductType === 'ready-made' && !p.isReadyMade) return false;
    if (selectedProductType === 'made-to-order' && p.isReadyMade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // Featured, Best Sellers, Ready to Ship slices
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const readyToShip = products.filter((p) => p.isReadyMade && p.stock > 0).slice(0, 4);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleNavigateCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenShop = (category = 'all') => {
    setSelectedCategory(category);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = (coupon?: { code: string; discount: number }) => {
    setAppliedCheckoutCoupon(coupon);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#F5DADB] selection:text-[#2D2527]">
      {/* Header with Navigation and 10-click Admin Entry */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          if (user) {
            setIsCustomerPortalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdminLogin={() => {
          if (isAdmin) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
        onOpenAccount={() => setIsCustomerPortalOpen(true)}
        onOpenPolicy={(key) => setActivePolicyKey(key)}
        onNavigateShop={(cat) => handleOpenShop(cat || 'all')}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && currentView !== 'shop') {
            setCurrentView('shop');
          }
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <div>
            {/* Hero Section */}
            <Hero
              onShopNow={() => handleOpenShop('all')}
              onCustomOrder={() => setIsCustomOrderOpen(true)}
            />

            {/* Category Showcase */}
            <CategoryShowcase
              categories={categories}
              onSelectCategory={handleNavigateCategory}
            />

            {/* Featured Creations */}
            <section className="py-16 bg-[#FAF6F0] border-t border-[#F5EFEB]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#9A7B1C] font-semibold">
                      Curated Highlights
                    </span>
                    <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2527] font-normal mt-1">
                      Featured Creations
                    </h2>
                  </div>
                  <button
                    onClick={() => handleOpenShop('all')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D2527] hover:text-[#9A7B1C] transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <span>View Full Catalogue</span>
                    <ArrowRight className="w-4 h-4 text-[#E5C365]" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Ready-to-Ship / Quick Dispatch Section */}
            <section className="py-16 bg-[#FDFBF7]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-[2.5rem] bg-gradient-to-r from-[#FAF6F0] to-[#F5DADB]/40 border border-[#E5C365]/40 p-8 sm:p-12 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Ready to Ship (Dispatches in 24 Hours)
                    </div>
                    <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#2D2527] font-semibold">
                      In-Stock Handmade Treasures
                    </h3>
                    <p className="text-xs sm:text-sm text-[#574A4E] max-w-xl">
                      Need a last-minute birthday gift, anniversary surprise, or graduation keepsake? These pieces are completely ready and dispatch across Pakistan within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductType('ready-made');
                      handleOpenShop('all');
                    }}
                    className="py-3.5 px-7 rounded-full bg-[#2D2527] text-white text-xs font-semibold hover:bg-[#45383B] transition-all flex items-center gap-2 shadow-md flex-shrink-0"
                  >
                    <span>Shop In-Stock Items</span>
                    <ArrowRight className="w-4 h-4 text-[#E5C365]" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {readyToShip.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Custom Order Atelier Banner */}
            <section className="py-16 bg-gradient-to-br from-[#2D2527] via-[#382D30] to-[#2D2527] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E5C365]/10 blur-3xl pointer-events-none" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E5C365] text-xs font-semibold tracking-wider uppercase border border-white/10">
                      <Sparkles className="w-3.5 h-3.5" />
                      Made Just For You
                    </span>
                    <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal leading-tight">
                      Commission Your Bespoke Keepsake
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 font-light max-w-2xl leading-relaxed">
                      Whether matching a specific wedding palette, designing a cherished cartoon companion, or crocheting a floral bouquet that lasts forever—our artisan brings your vision to life stitch by stitch.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={() => setIsCustomOrderOpen(true)}
                        className="py-3.5 px-8 rounded-full bg-[#E5C365] text-[#2D2527] font-semibold text-xs sm:text-sm hover:bg-[#D4AF37] transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#2D2527]" />
                        <span>Start Custom Request</span>
                      </button>
                      <button
                        onClick={() => setActivePolicyKey('customOrderPolicy')}
                        className="py-3.5 px-6 rounded-full bg-white/10 text-white font-medium text-xs sm:text-sm hover:bg-white/20 transition-all border border-white/20"
                      >
                        How Custom Orders Work
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 text-center lg:text-right">
                    <div className="inline-block p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
                      <h4 className="font-serif-luxury text-lg font-bold text-[#E5C365] mb-2">
                        Why Choose B. Crochet?
                      </h4>
                      <ul className="text-xs text-white/80 space-y-2">
                        <li>✨ 100% Non-pilling Milk Cotton Yarn</li>
                        <li>✨ Custom color matching to photos</li>
                        <li>✨ Transparent quotations in PKR</li>
                        <li>✨ Reliable Leopards & TCS Courier</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Sellers Section */}
            <section className="py-16 bg-[#FAF6F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="text-xs uppercase tracking-widest text-[#9A7B1C] font-semibold">
                    Client Favorites
                  </span>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2527] font-normal mt-1">
                    Most Loved Pieces
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestSellers.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Verified Customer Reviews Section */}
            <section className="py-16 bg-[#FDFBF7] border-t border-[#F5EFEB]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <div className="flex justify-center text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2527] font-normal">
                    Loved Across Pakistan
                  </h2>
                  <p className="text-xs text-[#7D6E73] mt-1">
                    Authentic customer experiences from Lahore, Karachi, Islamabad, and beyond.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reviews.slice(0, 3).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <h4 className="font-serif-luxury text-base font-bold text-[#2D2527]">
                          "{rev.title}"
                        </h4>
                        <p className="text-xs text-[#574A4E] leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#F5EFEB] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#2D2527]">{rev.customerName}</p>
                          <span className="text-[10px] text-[#7D6E73]">Verified Patron</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#9A7B1C]">
                          {rev.productName?.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Artisan Story / About Boutique */}
            <section className="py-16 bg-[#FAF6F0] border-t border-[#F5EFEB]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5">
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-[#F5DADB]">
                      <img
                        src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
                        alt="Crochet yarn crafting"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs uppercase tracking-widest text-[#9A7B1C] font-semibold">
                      The Artisan Philosophy
                    </span>
                    <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2527]">
                      Handmade With Gentle Devotion
                    </h2>
                    <p className="text-xs sm:text-sm text-[#574A4E] leading-relaxed font-light">
                      In a world of fleeting mass production, B. Crochet Boutique was founded in Pakistan on the belief that everyday items should carry soul, texture, and lasting warmth.
                    </p>
                    <p className="text-xs sm:text-sm text-[#574A4E] leading-relaxed font-light">
                      Each flower petal is looped by hand; each floral granny square is blocked to precision; each stuffed amigurumi friend is carefully stitched to withstand years of affection. We are honored to be part of your celebrations and milestones.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setActivePolicyKey('aboutUs')}
                        className="text-xs font-bold text-[#2D2527] hover:text-[#9A7B1C] underline underline-offset-4"
                      >
                        Read Full Story & Craft Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* SHOP CATALOGUE VIEW */
          <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pb-8 border-b border-[#EFE7DE]">
              <span className="text-xs uppercase tracking-widest text-[#9A7B1C] font-semibold">
                Catalogue
              </span>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2527] font-semibold mt-1">
                Explore The Crochet Collection
              </h1>
              <p className="text-xs text-[#7D6E73] mt-1">
                Showing {sortedProducts.length} handcrafted pieces in Pakistani Rupees (PKR)
              </p>
            </div>

            {/* Filter Bar */}
            <div className="py-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category selector pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`py-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#2D2527] text-white'
                      : 'bg-[#FAF6F0] text-[#574A4E] border border-[#EFE7DE] hover:border-[#C59B27]'
                  }`}
                >
                  All Categories ({products.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`py-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-[#2D2527] text-white'
                        : 'bg-[#FAF6F0] text-[#574A4E] border border-[#EFE7DE] hover:border-[#C59B27]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Type Filter & Sort Controls */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs font-semibold text-[#2D2527] focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="ready-made">Ready to Ship (In Stock)</option>
                  <option value="made-to-order">Made to Order</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs font-semibold text-[#2D2527] focus:outline-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <p className="font-serif-luxury text-2xl text-[#2D2527]">No creations match your filters</p>
                <p className="text-xs text-[#7D6E73]">
                  Try clearing your search or switching categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedProductType('all');
                    setSearchQuery('');
                  }}
                  className="py-2 px-5 rounded-xl bg-[#2D2527] text-white text-xs font-semibold mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={handleSelectProduct} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPolicy={(key) => setActivePolicyKey(key)}
        onNavigateCategory={handleNavigateCategory}
        onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
        onOpenAdminLogin={() => {
          if (isAdmin) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
      />

      <CustomOrderModal
        isOpen={isCustomOrderOpen}
        onClose={() => setIsCustomOrderOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        appliedCoupon={appliedCheckoutCoupon}
        onOrderSuccess={(order) => {
          fetchProducts(); // Refresh in-stock counts
        }}
      />

      <CustomerPortal
        isOpen={isCustomerPortalOpen}
        onClose={() => setIsCustomerPortalOpen(false)}
        onSelectProduct={handleSelectProduct}
        products={products}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsCustomerPortalOpen(true)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => setIsAdminDashboardOpen(true)}
      />

      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onProductsChanged={fetchProducts}
      />

      <PolicyModal
        policyKey={activePolicyKey}
        isOpen={Boolean(activePolicyKey)}
        onClose={() => setActivePolicyKey(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <WishlistProvider>
          <CartProvider>
            <MainStorefront />
          </CartProvider>
        </WishlistProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}
