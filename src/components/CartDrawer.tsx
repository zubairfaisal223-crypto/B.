import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import {
  formatPKR,
  calculateDeliveryFee,
  calculateDiscount,
  calculateOrderTotal,
  DEFAULT_DELIVERY_RULES,
  CouponRule,
} from '../utils/pricing';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (appliedCoupon?: { code: string; discount: number }) => void;
}

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Other City',
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount } = useCart();
  const { settings } = useStoreSettings();

  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const deliveryRules = settings?.deliveryRules || DEFAULT_DELIVERY_RULES;
  const deliveryFee = calculateDeliveryFee(subtotal, selectedCity, deliveryRules);

  const discountAmount = appliedCoupon?.discount || 0;
  const finalTotal = calculateOrderTotal({
    subtotal,
    deliveryFee,
    discount: discountAmount,
  });

  const freeDeliveryThreshold = deliveryRules.freeDeliveryThreshold;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid coupon code');
      }

      setAppliedCoupon({
        code: data.code,
        discount: data.discount,
        discountType: data.discountType,
      });
    } catch (err: any) {
      setCouponError(err.message || 'Could not apply coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col border-l border-[#F5EFEB]">
          {/* Header */}
          <div className="p-5 border-b border-[#F5EFEB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#2D2527]" />
              <h2 className="font-serif-luxury text-xl font-bold text-[#2D2527]">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#FAF6F0] p-3.5 border-b border-[#F5EFEB] text-xs">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#574A4E]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-4 h-4 text-[#9A7B1C]" />
                    Add <strong className="text-[#2D2527]">{formatPKR(amountNeededForFreeDelivery)}</strong> more for FREE delivery
                  </span>
                  <span className="font-bold text-[#9A7B1C]">{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full bg-[#EFE7DE] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#E5C365] to-[#C59B27] h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You unlocked FREE Nationwide Delivery across Pakistan!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#7D6E73] mx-auto border border-[#EFE7DE]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-serif-luxury text-xl text-[#2D2527]">Your bag is empty</h3>
                <p className="text-xs text-[#7D6E73] max-w-xs mx-auto">
                  Discover our handmade bouquets, forever potted flowers, and whimsical crochet gifts.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-3.5 p-3 rounded-2xl bg-white border border-[#F5EFEB] shadow-xs"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF6F0] flex-shrink-0">
                    <img
                      src={item.product.images[0] || ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#2D2527] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() =>
                            removeItem(item.product.id, item.selectedColor, item.selectedSize)
                          }
                          className="text-[#7D6E73] hover:text-red-500 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#7D6E73] mt-0.5">
                        {item.selectedColor} • {item.selectedSize}
                      </div>

                      {item.product.isReadyMade ? (
                        <span className="text-[10px] text-emerald-700 font-medium">Ready to ship</span>
                      ) : (
                        <span className="text-[10px] text-[#D4737B] font-medium">
                          Made to order (~{item.product.estimatedProductionDays}d)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F5EFEB]">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] px-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedColor,
                              item.selectedSize,
                              item.quantity - 1
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#2D2527]"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#2D2527]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedColor,
                              item.selectedSize,
                              item.quantity + 1
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#2D2527]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif-luxury font-bold text-sm text-[#2D2527]">
                        {formatPKR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#F5EFEB] bg-white space-y-3">
              {/* City Selection for real-time shipping estimate */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#574A4E] font-medium">Delivery Destination:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs font-semibold text-[#2D2527] focus:outline-none"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon input */}
              <div className="pt-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Coupon <strong className="font-mono">{appliedCoupon.code}</strong> applied (-{formatPKR(appliedCoupon.discount)})
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-red-600 font-bold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Discount Coupon (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs uppercase font-mono text-[#2D2527]"
                      />
                      <Tag className="w-3.5 h-3.5 text-[#7D6E73] absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="py-2 px-3.5 rounded-xl bg-[#2D2527] text-white text-xs font-semibold disabled:opacity-40"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}
              </div>

              {/* Subtotal breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-[#F5EFEB] text-xs text-[#574A4E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2D2527]">{formatPKR(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery ({selectedCity})</span>
                  <span className="font-semibold text-[#2D2527]">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">Free</span>
                    ) : (
                      formatPKR(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#EFE7DE]">
                  <span className="font-serif-luxury text-base font-bold text-[#2D2527]">Estimated Total</span>
                  <span className="font-serif-luxury text-xl font-bold text-[#2D2527]">
                    {formatPKR(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout(appliedCoupon || undefined);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#FAF6F0] font-semibold text-sm hover:from-[#3D3336] hover:to-[#574A4E] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#E5C365]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
