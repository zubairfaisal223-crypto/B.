import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateDeliveryFee,
  calculateDiscount,
  calculateOrderTotal,
  calculateCraftProfit,
  formatPKR,
  DEFAULT_DELIVERY_RULES,
  CouponRule
} from './pricing';

test('calculateSubtotal accurately sums items with quantity', () => {
  const items = [
    { id: '1', price: 1500, quantity: 2 }, // 3000
    { id: '2', price: 850, quantity: 1 },  // 850
    { id: '3', price: 300, quantity: 3 },  // 900
  ];
  assert.equal(calculateSubtotal(items), 4750);
});

test('calculateSubtotal handles zero and empty carts gracefully', () => {
  assert.equal(calculateSubtotal([]), 0);
  assert.equal(calculateSubtotal([{ id: '1', price: -50, quantity: 1 }]), 0);
});

test('calculateDeliveryFee applies city specific rate and free delivery threshold', () => {
  // Lahore rate is 220
  assert.equal(calculateDeliveryFee(2000, 'Lahore', DEFAULT_DELIVERY_RULES), 220);
  // Karachi rate is 200
  assert.equal(calculateDeliveryFee(2000, 'Karachi', DEFAULT_DELIVERY_RULES), 200);
  // Unknown city falls back to standard fee (250)
  assert.equal(calculateDeliveryFee(2000, 'Gilgit', DEFAULT_DELIVERY_RULES), 250);
  // Free delivery threshold (>= 4500) gives 0 delivery fee
  assert.equal(calculateDeliveryFee(4500, 'Quetta', DEFAULT_DELIVERY_RULES), 0);
  assert.equal(calculateDeliveryFee(6000, 'Lahore', DEFAULT_DELIVERY_RULES), 0);
});

test('calculateDiscount validates percentage and capped coupons', () => {
  const coupon: CouponRule = {
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    isActive: true,
  };
  const res = calculateDiscount(3000, coupon);
  assert.equal(res.discount, 300);
  assert.equal(res.error, undefined);

  // With max discount cap
  const cappedCoupon: CouponRule = {
    code: 'SAVEBIG',
    discountType: 'percentage',
    value: 50,
    maxDiscountAmount: 500,
    isActive: true,
  };
  assert.equal(calculateDiscount(2000, cappedCoupon).discount, 500);
});

test('calculateDiscount respects minimum order amounts and expiry', () => {
  const minCoupon: CouponRule = {
    code: 'MIN3000',
    discountType: 'fixed',
    value: 400,
    minOrderAmount: 3000,
    isActive: true,
  };
  const belowMin = calculateDiscount(2500, minCoupon);
  assert.equal(belowMin.discount, 0);
  assert.match(belowMin.error || '', /Minimum order amount/);

  const aboveMin = calculateDiscount(3500, minCoupon);
  assert.equal(aboveMin.discount, 400);

  // Expired coupon
  const expiredCoupon: CouponRule = {
    code: 'EXPIRED',
    discountType: 'percentage',
    value: 20,
    expiryDate: '2020-01-01',
    isActive: true,
  };
  const expiredRes = calculateDiscount(1000, expiredCoupon);
  assert.equal(expiredRes.discount, 0);
  assert.match(expiredRes.error || '', /expired/);
});

test('calculateOrderTotal computes subtotal minus discount plus delivery fee', () => {
  const total = calculateOrderTotal({
    subtotal: 5000,
    discount: 500,
    deliveryFee: 200,
  });
  assert.equal(total, 4700);
});

test('calculateCraftProfit accurately calculates costs and profit margin', () => {
  const profit = calculateCraftProfit({
    sellingPrice: 3500,
    yarnCost: 600,
    labourCost: 1000,
    packagingCost: 200,
    deliveryEstimateCost: 200,
  });

  assert.equal(profit.totalCost, 2000);
  assert.equal(profit.netProfit, 1500);
  assert.equal(profit.marginPercent, 43);
  assert.equal(profit.isProfitable, true);
});

test('formatPKR formats currency string properly', () => {
  assert.equal(formatPKR(2500), 'Rs. 2,500');
  assert.equal(formatPKR(0), 'Rs. 0');
});
