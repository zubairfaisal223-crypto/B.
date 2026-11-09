import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  MapPin,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatPKR, calculateDeliveryFee, calculateDiscount, calculateOrderTotal, DEFAULT_DELIVERY_RULES } from '../utils/pricing';
import { PaymentMethod, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedCoupon?: { code: string; discount: number };
  onOrderSuccess: (order: Order) => void;
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
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Other City (Pakistan)',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  appliedCoupon,
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useStoreSettings();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || 'Lahore');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const deliveryRules = settings?.deliveryRules || DEFAULT_DELIVERY_RULES;
  const deliveryFee = calculateDeliveryFee(subtotal, city, deliveryRules);
  const discount = appliedCoupon?.discount || 0;
  const finalTotal = calculateOrderTotal({ subtotal, deliveryFee, discount });

  const pSettings = settings?.paymentSettings;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderPayload = {
        customerName,
        phone,
        email,
        city,
        deliveryAddress,
        postalCode,
        orderNotes,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('b_crochet_token')}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setConfirmedOrder(data.order);
      clearCart();
      onOrderSuccess(data.order);
    } catch (err: any) {
      setError(err.message || 'Error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-[2.5rem] max-w-3xl w-full my-auto shadow-2xl border border-[#E5C365]/40 overflow-hidden relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F5DADB] flex items-center justify-center text-[#D4737B] mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="font-serif-luxury text-3xl font-semibold text-[#2D2527]">
              Order Placed Successfully!
            </h2>

            <div className="p-5 rounded-3xl bg-white border border-[#E5C365]/40 max-w-lg mx-auto text-left shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[#F5EFEB]">
                <span className="text-xs text-[#7D6E73]">Order Reference:</span>
                <span className="text-base font-mono font-bold text-[#9A7B1C]">
                  {confirmedOrder.orderNumber}
                </span>
              </div>

              <div className="text-xs text-[#574A4E] space-y-1">
                <p>
                  <strong>Recipient:</strong> {confirmedOrder.customerName} ({confirmedOrder.phone})
                </p>
                <p>
                  <strong>Delivery City:</strong> {confirmedOrder.city}
                </p>
                <p>
                  <strong>Total Amount:</strong> {formatPKR(confirmedOrder.total)}
                </p>
                <p>
                  <strong>Payment Method:</strong>{' '}
                  <span className="uppercase font-semibold">{confirmedOrder.paymentMethod}</span>
                </p>
              </div>

              {/* Payment Instructions if JazzCash or Easypaisa */}
              {confirmedOrder.paymentMethod === 'jazzcash' && pSettings && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold">JazzCash Payment Instructions:</p>
                  <p className="mt-0.5">{pSettings.jazzcashInstructions}</p>
                </div>
              )}

              {confirmedOrder.paymentMethod === 'easypaisa' && pSettings && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <p className="font-bold">Easypaisa Payment Instructions:</p>
                  <p className="mt-0.5">{pSettings.easypaisaInstructions}</p>
                </div>
              )}

              {confirmedOrder.paymentMethod === 'cod' && (
                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#574A4E]">
                  <p className="font-bold text-[#2D2527]">Cash on Delivery:</p>
                  <p className="mt-0.5">
                    Please keep exact cash ready upon delivery. Our courier representative will contact you on WhatsApp / SMS before delivery.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={`https://wa.me/${settings?.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20B.%20Crochet,%20I%20have%20placed%20order%20${confirmedOrder.orderNumber}%20for%20PKR%20${confirmedOrder.total}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-full bg-[#25D366] text-white font-semibold text-xs sm:text-sm hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </a>
              <button
                onClick={onClose}
                className="py-3 px-6 rounded-full bg-[#2D2527] text-white font-semibold text-xs sm:text-sm hover:bg-[#45383B] transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <>
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-[#9A7B1C] font-semibold">
                Secure Checkout
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#2D2527]">
                Shipping & Payment Details
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
              {/* Delivery Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2527] mb-3 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#C59B27]" /> 1. Delivery Address (Pakistan)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Zainab Tariq"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                      />
                      <User className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      Phone Number (for Courier & WhatsApp) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                      />
                      <Phone className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="zainab@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                      />
                      <Mail className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      City * (Delivery: {deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)})
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      Complete Delivery Address (House / Flat, Street, Area) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. House 14-B, Street 3, DHA Phase 5"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                      />
                      <MapPin className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 54000"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                      Order / Delivery Notes
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Special instructions for courier or gift card"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2527] mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C59B27]" /> 2. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* COD */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-[#2D2527] bg-[#FAF6F0] shadow-xs'
                        : 'border-[#EFE7DE] bg-white opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-[#2D2527] focus:ring-0"
                      />
                      <span className="text-xs font-bold text-[#2D2527]">Cash on Delivery</span>
                    </div>
                    <p className="text-[10px] text-[#7D6E73] mt-2">
                      Pay cash to courier upon receiving parcel.
                    </p>
                  </label>

                  {/* JazzCash */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'jazzcash'
                        ? 'border-[#2D2527] bg-[#FAF6F0] shadow-xs'
                        : 'border-[#EFE7DE] bg-white opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="jazzcash"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={() => setPaymentMethod('jazzcash')}
                        className="text-[#2D2527] focus:ring-0"
                      />
                      <span className="text-xs font-bold text-[#2D2527]">JazzCash</span>
                    </div>
                    <p className="text-[10px] text-[#7D6E73] mt-2">
                      Official mobile wallet transfer with receipt verification.
                    </p>
                  </label>

                  {/* Easypaisa */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'easypaisa'
                        ? 'border-[#2D2527] bg-[#FAF6F0] shadow-xs'
                        : 'border-[#EFE7DE] bg-white opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="easypaisa"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={() => setPaymentMethod('easypaisa')}
                        className="text-[#2D2527] focus:ring-0"
                      />
                      <span className="text-xs font-bold text-[#2D2527]">Easypaisa</span>
                    </div>
                    <p className="text-[10px] text-[#7D6E73] mt-2">
                      Official wallet transfer with instant WhatsApp confirmation.
                    </p>
                  </label>
                </div>

                {/* Wallet Details Notice */}
                {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <p className="font-semibold">Wallet Transfer Details:</p>
                    <p className="mt-0.5">
                      {paymentMethod === 'jazzcash'
                        ? pSettings?.jazzcashInstructions
                        : pSettings?.easypaisaInstructions}
                    </p>
                    <p className="text-[11px] text-[#7D6E73] mt-1">
                      Security guarantee: We never ask for your wallet PIN or OTP. All transactions are securely verified via official bank/wallet transaction ID.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary & Final Total */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] text-xs space-y-2">
                <h4 className="font-bold text-[#2D2527] pb-1 border-b border-[#F5EFEB]">
                  Order Summary ({items.length} unique items)
                </h4>

                <div className="flex justify-between text-[#574A4E]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2D2527]">{formatPKR(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-{formatPKR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#574A4E]">
                  <span>Delivery ({city})</span>
                  <span className="font-semibold text-[#2D2527]">
                    {deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#EFE7DE]">
                  <span className="font-serif-luxury text-base font-bold text-[#2D2527]">Total to Pay</span>
                  <span className="font-serif-luxury text-2xl font-bold text-[#2D2527]">
                    {formatPKR(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#FAF6F0] font-semibold text-sm hover:from-[#3D3336] hover:to-[#574A4E] transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Lock className="w-4 h-4 text-[#E5C365]" />
                <span>
                  {loading
                    ? 'Verifying & Placing Order...'
                    : `Confirm Order • ${formatPKR(finalTotal)}`}
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
