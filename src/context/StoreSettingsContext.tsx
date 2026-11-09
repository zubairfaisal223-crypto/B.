import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { DEFAULT_DELIVERY_RULES } from '../utils/pricing';

interface StoreSettingsContextType {
  settings: StoreSettings | null;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'B.',
  tagline: 'Luxury Handmade Crochet Boutique',
  contactPhone: '+92 300 8765432',
  whatsappNumber: '+92 300 8765432',
  contactEmail: 'contact@bcrochet.pk',
  currencySymbol: 'PKR',
  announcementBar: {
    enabled: true,
    text: '✨ Free Delivery across Pakistan on orders over Rs. 4,500 | Crafted with pure luxury yarn 🌸',
    linkText: 'Shop Now',
  },
  heroBanner: {
    headline: 'Where Every Stitch Tells an Heirloom Story',
    subheadline: 'Bespoke handcrafted crochet bouquets, heirloom bags, and whimsical custom pieces created in Pakistan with premium milk cotton yarn.',
    ctaText: 'Explore Collection',
    customCtaText: 'Request Custom Order',
    bannerImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=85',
  },
  deliveryRules: DEFAULT_DELIVERY_RULES,
  paymentSettings: {
    codEnabled: true,
    jazzcashEnabled: true,
    jazzcashStatus: 'manual',
    jazzcashAccountTitle: 'B. Crochet Boutique (Official)',
    jazzcashAccountNumber: '0300-8765432',
    jazzcashInstructions: 'Please transfer the order total to JazzCash 0300-8765432 (Title: B. Crochet Boutique) and share screenshot with Order # on WhatsApp +92 300 8765432.',
    easypaisaEnabled: true,
    easypaisaStatus: 'manual',
    easypaisaAccountTitle: 'B. Crochet Boutique (Official)',
    easypaisaAccountNumber: '0345-1234567',
    easypaisaInstructions: 'Please transfer the order total to Easypaisa 0345-1234567 (Title: B. Crochet Boutique) and share screenshot with Order # on WhatsApp +92 300 8765432.',
  },
  policies: {
    aboutUs: 'Luxury handmade crochet boutique based in Pakistan...',
    shippingPolicy: 'Standard delivery across Pakistan is Rs. 250...',
    returnRefundPolicy: 'Items are handmade with love...',
    privacyPolicy: 'We respect your privacy...',
    termsConditions: 'All sales are subject to artisanal craftsmanship...',
    customOrderPolicy: 'Custom orders require 3-7 days production...',
  },
};

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        refreshSettings: fetchSettings,
        isLoading,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return ctx;
}
