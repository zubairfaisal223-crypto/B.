import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenAdminLogin: () => void;
  onOpenCustomOrder: () => void;
  onOpenAccount: () => void;
  onOpenPolicy: (policyKey: string) => void;
  onNavigateShop: (category?: string) => void;
  onNavigateHome: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenAdminLogin,
  onOpenCustomOrder,
  onOpenAccount,
  onOpenPolicy,
  onNavigateShop,
  onNavigateHome,
  searchQuery,
  onSearchChange,
}) => {
  const { user, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useStoreSettings();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Hidden admin-entry shortcut: 10 clicks on B. logo within 5 seconds reveals admin login modal
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    if (logoClicks === 0) return;
    const timer = setTimeout(() => {
      setLogoClicks(0);
    }, 4000);
    return () => clearTimeout(timer);
  }, [logoClicks]);

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    if (nextClicks >= 10) {
      setLogoClicks(0);
      onOpenAdminLogin();
    } else {
      setLogoClicks(nextClicks);
      if (nextClicks === 1) {
        onNavigateHome();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#F5EFEB] transition-all">
      {/* Announcement Bar */}
      {settings?.announcementBar.enabled && (
        <div className="bg-[#2D2527] text-[#FAF6F0] py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-between">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-center">
            <span className="line-clamp-1">{settings.announcementBar.text}</span>
            {settings.announcementBar.linkText && (
              <button
                onClick={() => onNavigateShop()}
                className="underline underline-offset-4 text-[#E5C365] hover:text-[#F5DADB] transition-colors whitespace-nowrap ml-1 cursor-pointer"
              >
                {settings.announcementBar.linkText} &rarr;
              </button>
            )}
          </div>
          {isAdmin && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] bg-[#E5C365]/20 text-[#E5C365] px-2 py-0.5 rounded font-mono">
              <ShieldCheck className="w-3 h-3" /> Admin Mode
            </span>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#2D2527] hover:text-[#C59B27] transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

          {/* Brand Logo with 10-click hidden shortcut */}
          <div className="flex items-center flex-shrink-0 mr-2 sm:mr-0">
            <button
              onClick={handleLogoClick}
              title="B. Crochet Boutique"
              className="group text-left flex items-center gap-1.5 sm:gap-2 focus:outline-none cursor-pointer select-none"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#F5DADB] to-[#ECA1A6] flex items-center justify-center text-[#2D2527] font-serif-luxury font-bold text-lg sm:text-2xl shadow-xs border border-[#E5C365]/40 group-hover:scale-105 transition-transform flex-shrink-0">
                B.
              </div>
              <div className="flex flex-col">
                <span className="font-serif-luxury text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#2D2527] group-hover:text-[#9A7B1C] transition-colors leading-none">
                  B. Crochet
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#7D6E73] font-medium hidden sm:inline">
                  Boutique • Pakistan
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-[#3D3336]">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#9A7B1C] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E5C365]"
            >
              Home
            </button>
            <button
              onClick={() => onNavigateShop()}
              className="hover:text-[#9A7B1C] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E5C365]"
            >
              Shop
            </button>
            <button
              onClick={() => onNavigateShop()}
              className="hover:text-[#9A7B1C] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E5C365]"
            >
              Categories
            </button>
            <button
              onClick={onOpenCustomOrder}
              className="inline-flex items-center gap-1.5 text-[#9A7B1C] hover:text-[#2D2527] font-semibold transition-colors cursor-pointer py-1"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Custom Orders
            </button>
            <button
              onClick={() => onOpenPolicy('aboutUs')}
              className="hover:text-[#9A7B1C] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E5C365]"
            >
              About Us
            </button>
            <button
              onClick={() => onOpenPolicy('shippingPolicy')}
              className="hover:text-[#9A7B1C] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E5C365]"
            >
              Delivery Info
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#3D3336] hover:text-[#9A7B1C] transition-colors focus:outline-none"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white p-3 rounded-xl shadow-xl border border-[#F5DADB] z-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search bouquets, bags, plushies..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onNavigateShop();
                          setSearchOpen(false);
                        }
                      }}
                      autoFocus
                      className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF6F0] rounded-lg border border-[#EFE7DE] focus:outline-none focus:border-[#D4AF37]"
                    />
                    <Search className="w-4 h-4 text-[#7D6E73] absolute left-3 top-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#3D3336] hover:text-[#D4737B] transition-colors"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#D4737B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account / Admin Dashboard Button */}
            {user ? (
              <button
                onClick={isAdmin ? onOpenAdminLogin : onOpenAccount}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#FAF6F0] border border-[#EFE7DE] hover:border-[#D4AF37] text-xs font-semibold text-[#2D2527] transition-all"
                aria-label="My Account"
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#7D6E73]" />
                )}
                <span className="max-w-[90px] truncate hidden sm:inline">
                  {isAdmin ? 'Admin' : user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 py-1.5 px-3 rounded-full hover:bg-[#FAF6F0] text-xs font-medium text-[#2D2527] transition-all"
                aria-label="Login or Register"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 py-2 px-3.5 bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#FAF6F0] rounded-full hover:shadow-md hover:from-[#3D3336] hover:to-[#574A4E] transition-all cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#E5C365]" />
              <span className="text-xs font-bold">{itemCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#F5EFEB] bg-[#FDFBF7] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 font-medium text-[#3D3336]">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#9A7B1C] flex items-center justify-between"
            >
              Home <ChevronRight className="w-4 h-4 text-[#7D6E73]" />
            </button>
            <button
              onClick={() => {
                onNavigateShop();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#9A7B1C] flex items-center justify-between"
            >
              Shop All Products <ChevronRight className="w-4 h-4 text-[#7D6E73]" />
            </button>
            <button
              onClick={() => {
                onOpenCustomOrder();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-[#9A7B1C] font-semibold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Bespoke Custom Orders
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onOpenPolicy('aboutUs');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#9A7B1C] flex items-center justify-between"
            >
              About The Artisan <ChevronRight className="w-4 h-4 text-[#7D6E73]" />
            </button>
            <button
              onClick={() => {
                onOpenPolicy('shippingPolicy');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#9A7B1C] flex items-center justify-between"
            >
              Shipping & Delivery in Pakistan <ChevronRight className="w-4 h-4 text-[#7D6E73]" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#F5EFEB] flex flex-col gap-3">
            <a
              href={`https://wa.me/${settings?.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20ba5a] transition-colors"
            >
              <Phone className="w-4 h-4" /> WhatsApp Order Support
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
