/**
 * Pure calculation logic for B. Crochet Boutique
 * Handles pricing, delivery rules across Pakistan, coupons, cost tracking, and order totals.
 */

export interface PricingItem {
  id?: string;
  productId?: string;
  price: number;
  quantity: number;
}

export interface DeliveryRules {
  standardFee: number;
  freeDeliveryThreshold: number;
  cityRates: Record<string, number>;
}

export interface CouponRule {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface CraftCostBreakdown {
  sellingPrice: number;
  yarnCost: number;
  labourCost: number;
  packagingCost: number;
  deliveryEstimateCost?: number;
}

export const DEFAULT_DELIVERY_RULES: DeliveryRules = {
  standardFee: 250,
  freeDeliveryThreshold: 4500,
  cityRates: {
    'Karachi': 200,
    'Lahore': 220,
    'Islamabad': 220,
    'Rawalpindi': 220,
    'Faisalabad': 250,
    'Multan': 250,
    'Peshawar': 280,
    'Quetta': 320,
    'Sialkot': 240,
    'Gujranwala': 240,
    'Hyderabad': 220,
  },
};

/**
 * Calculates cart subtotal
 */
export function calculateSubtotal(items: PricingItem[]): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const p = Math.max(0, Number(item.price) || 0);
    const q = Math.max(0, Math.floor(Number(item.quantity) || 0));
    return sum + p * q;
  }, 0);
}

/**
 * Calculates delivery fee based on city and cart subtotal
 */
export function calculateDeliveryFee(
  subtotal: number,
  city: string,
  rules: DeliveryRules = DEFAULT_DELIVERY_RULES
): number {
  if (subtotal <= 0) return 0;
  
  // Free delivery threshold check
  if (rules.freeDeliveryThreshold > 0 && subtotal >= rules.freeDeliveryThreshold) {
    return 0;
  }

  const normalizedCity = city?.trim();
  if (normalizedCity && rules.cityRates && typeof rules.cityRates[normalizedCity] === 'number') {
    return rules.cityRates[normalizedCity];
  }

  return rules.standardFee ?? 250;
}

/**
 * Validates and calculates coupon discount
 */
export function calculateDiscount(
  subtotal: number,
  coupon?: CouponRule | null,
  now = new Date()
): { discount: number; error?: string } {
  if (!coupon) return { discount: 0 };
  
  if (!coupon.isActive) {
    return { discount: 0, error: 'This coupon is no longer active.' };
  }

  if (coupon.expiryDate) {
    const expiry = new Date(coupon.expiryDate);
    if (!isNaN(expiry.getTime()) && now > expiry) {
      return { discount: 0, error: 'This coupon has expired.' };
    }
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      discount: 0,
      error: `Minimum order amount of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon.`
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(subtotal, Math.round(coupon.value));
  }

  return { discount: Math.max(0, discount) };
}

/**
 * Recalculates final order total on server
 */
export function calculateOrderTotal(params: {
  subtotal: number;
  deliveryFee: number;
  discount: number;
}): number {
  const { subtotal, deliveryFee, discount } = params;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  return taxableSubtotal + Math.max(0, deliveryFee);
}

/**
 * Internal craft profit calculation for handmade crochet items
 */
export function calculateCraftProfit(costs: CraftCostBreakdown) {
  const selling = Math.max(0, costs.sellingPrice || 0);
  const yarn = Math.max(0, costs.yarnCost || 0);
  const labour = Math.max(0, costs.labourCost || 0);
  const packaging = Math.max(0, costs.packagingCost || 0);
  const delivery = Math.max(0, costs.deliveryEstimateCost || 0);

  const totalCost = yarn + labour + packaging + delivery;
  const profit = selling - totalCost;
  const marginPercent = selling > 0 ? Math.round((profit / selling) * 100) : 0;

  return {
    sellingPrice: selling,
    totalCost,
    yarnCost: yarn,
    labourCost: labour,
    packagingCost: packaging,
    deliveryEstimateCost: delivery,
    netProfit: profit,
    marginPercent,
    isProfitable: profit > 0
  };
}

/**
 * Formats a number to Pakistani Rupees display
 */
export function formatPKR(amount: number): string {
  const safeNum = Math.round(Number(amount) || 0);
  return `Rs. ${safeNum.toLocaleString('en-PK')}`;
}
