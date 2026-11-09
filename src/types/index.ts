export interface InternalCraftCosts {
  yarnCost: number;
  labourCost: number;
  packagingCost: number;
  deliveryEstimateCost: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  colors: string[];
  sizes: string[];
  stock: number;
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isReadyMade: boolean;
  estimatedProductionDays: number;
  images: string[];
  yarnType: string;
  dimensions?: string;
  careInstructions?: string;
  internalCosts: InternalCraftCosts;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  itemCount?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  isReadyMade: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa';
export type PaymentStatus = 'pending' | 'verified' | 'paid' | 'failed';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  deliveryAddress: string;
  postalCode?: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierTrackingNumber?: string;
  courierName?: string;
  refundAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomRequestStatus =
  | 'pending_review'
  | 'quotation_sent'
  | 'accepted'
  | 'in_production'
  | 'completed'
  | 'rejected';

export interface CustomRequest {
  id: string;
  requestNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  productType: string;
  preferredColours: string;
  size: string;
  quantity: number;
  budgetPKR: number;
  deadline: string;
  referenceImage?: string;
  additionalInstructions?: string;
  status: CustomRequestStatus;
  quotationPricePKR?: number;
  adminNotes?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  role: 'admin' | 'customer';
  wishlist: string[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  currencySymbol: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    linkText?: string;
  };
  heroBanner: {
    headline: string;
    subheadline: string;
    ctaText: string;
    customCtaText: string;
    bannerImage: string;
  };
  deliveryRules: {
    standardFee: number;
    freeDeliveryThreshold: number;
    cityRates: Record<string, number>;
  };
  paymentSettings: {
    codEnabled: boolean;
    jazzcashEnabled: boolean;
    jazzcashStatus: 'manual' | 'gateway_ready';
    jazzcashAccountTitle: string;
    jazzcashAccountNumber: string;
    jazzcashInstructions: string;
    easypaisaEnabled: boolean;
    easypaisaStatus: 'manual' | 'gateway_ready';
    easypaisaAccountTitle: string;
    easypaisaAccountNumber: string;
    easypaisaInstructions: string;
  };
  policies: {
    aboutUs: string;
    shippingPolicy: string;
    returnRefundPolicy: string;
    privacyPolicy: string;
    termsConditions: string;
    customOrderPolicy: string;
  };
}
