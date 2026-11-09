import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Heart,
  Sparkles,
  ShieldCheck,
  Truck,
  Lock,
} from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface FooterProps {
  onOpenPolicy: (key: string) => void;
  onNavigateCategory: (catId: string) => void;
  onOpenCustomOrder: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicy,
  onNavigateCategory,
  onOpenCustomOrder,
  onOpenAdminLogin,
}) => {
  const { settings } = useStoreSettings();

  return (
    <footer className="bg-[#2D2527] text-[#FAF6F0] pt-16 pb-12 border-t border-[#45383B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#45383B]">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5DADB] to-[#ECA1A6] flex items-center justify-center text-[#2D2527] font-serif-luxury font-bold text-xl shadow-sm border border-[#E5C365]">
                B.
              </div>
              <span className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                B. Crochet Boutique
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#FAF6F0]/70 font-light leading-relaxed max-w-sm">
              An artisanal crochet atelier based in Pakistan. We handcraft forever botanical bouquets, heirloom handbags, and bespoke custom crochet keepsakes using pure luxury milk cotton yarn.
            </p>

            <div className="pt-2 text-xs text-[#E5C365] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Proudly handcrafted in Pakistan • Prices in PKR</span>
            </div>
          </div>

          {/* Quick Collections */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-luxury text-base font-semibold text-white tracking-wide">
              Bespoke Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF6F0]/80">
              <li>
                <button
                  onClick={() => onNavigateCategory('cat-bouquets')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Crochet Bouquets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('cat-flowers')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Everlasting Potted Flowers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('cat-bags')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Artisan Handbags & Totes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('cat-plushies')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Amigurumi Plushies
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCustomOrder}
                  className="text-[#E5C365] font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Request Custom Creation
                </button>
              </li>
            </ul>
          </div>

          {/* Store Policies */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-luxury text-base font-semibold text-white tracking-wide">
              Information & Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF6F0]/80">
              <li>
                <button
                  onClick={() => onOpenPolicy('aboutUs')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  About the Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('shippingPolicy')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Shipping & Delivery PK
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('returnRefundPolicy')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('customOrderPolicy')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Custom Order Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacyPolicy')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('termsConditions')}
                  className="hover:text-[#E5C365] transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-luxury text-base font-semibold text-white tracking-wide">
              Artisan Helpline
            </h4>
            <div className="space-y-2.5 text-xs text-[#FAF6F0]/80">
              <a
                href={`https://wa.me/${settings?.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp: {settings?.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E5C365]" />
                <span>{settings?.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4737B]" />
                <span>Lahore, Pakistan (Nationwide Delivery)</span>
              </div>
            </div>

            {/* Payment & Logistics Trust Badges */}
            <div className="pt-3">
              <span className="text-[10px] uppercase tracking-wider text-[#FAF6F0]/60 font-semibold block mb-2">
                Supported Across Pakistan
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-1 rounded bg-[#45383B] text-white">Cash on Delivery</span>
                <span className="px-2 py-1 rounded bg-[#45383B] text-amber-300">JazzCash</span>
                <span className="px-2 py-1 rounded bg-[#45383B] text-emerald-300">Easypaisa</span>
                <span className="px-2 py-1 rounded bg-[#45383B] text-blue-300">Leopards / TCS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF6F0]/60 gap-4">
          <p>© 2026 B. Crochet Boutique. All rights reserved. Handcrafted with love.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdminLogin}
              className="text-[#FAF6F0]/40 hover:text-[#E5C365] text-[11px] flex items-center gap-1 transition-colors"
              title="Store Owner Admin Login"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Entrance</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
