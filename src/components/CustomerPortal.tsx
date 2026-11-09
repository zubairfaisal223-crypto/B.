import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Order, CustomRequest, Product } from '../types';
import { formatPKR } from '../utils/pricing';

interface CustomerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products,
}) => {
  const { user, token, logout, updateUser } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'custom' | 'wishlist' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      setName(user.name);
      setPhone(user.phone || '');
      setCity(user.city || '');
      setAddress(user.address || '');

      // Load customer's own orders
      setLoadingOrders(true);
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setOrders(data))
        .catch((err) => console.error('Failed to load orders', err))
        .finally(() => setLoadingOrders(false));

      // Load customer's own custom requests
      setLoadingCustom(true);
      fetch('/api/custom-requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setCustomRequests(data))
        .catch((err) => console.error('Failed to load custom requests', err))
        .finally(() => setLoadingCustom(false));
    }
  }, [user, token]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, city, address }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setProfileSuccess('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'dispatched':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Dispatched (In Transit)</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">In Production / Processing</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Order Confirmed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">Pending Review</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-[2.5rem] max-w-4xl w-full my-auto shadow-2xl border border-[#F5EFEB] overflow-hidden relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EFE7DE] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5DADB] to-[#ECA1A6] flex items-center justify-center text-[#2D2527] font-serif-luxury font-bold text-xl border border-[#E5C365]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#2D2527]">
                Welcome, {user.name}
              </h2>
              <p className="text-xs text-[#7D6E73]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-[#EFE7DE] text-xs font-semibold text-[#7D6E73] hover:text-[#D4737B] hover:bg-white transition-all self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EFE7DE] my-4 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-4 rounded-t-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-[#2D2527] text-[#FAF6F0]'
                : 'text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 px-4 rounded-t-xl transition-all ${
              activeTab === 'custom'
                ? 'bg-[#2D2527] text-[#FAF6F0]'
                : 'text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]'
            }`}
          >
            Custom Requests ({customRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-2.5 px-4 rounded-t-xl transition-all ${
              activeTab === 'wishlist'
                ? 'bg-[#2D2527] text-[#FAF6F0]'
                : 'text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]'
            }`}
          >
            Saved Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 rounded-t-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-[#2D2527] text-[#FAF6F0]'
                : 'text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]'
            }`}
          >
            Delivery Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loadingOrders ? (
                <p className="text-xs text-[#7D6E73] py-8 text-center">Loading your orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-[#7D6E73] mx-auto opacity-40" />
                  <p className="font-serif-luxury text-lg text-[#2D2527]">No orders placed yet</p>
                  <p className="text-xs text-[#7D6E73]">Explore our handcrafted bouquets and bags!</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F5EFEB]">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#9A7B1C]">
                          #{o.orderNumber}
                        </span>
                        <span className="text-[11px] text-[#7D6E73] ml-2">
                          {new Date(o.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(o.orderStatus)}
                        <span className="font-serif-luxury font-bold text-sm text-[#2D2527]">
                          {formatPKR(o.total)}
                        </span>
                      </div>
                    </div>

                    {/* Ordered items preview */}
                    <div className="space-y-1.5">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-[#574A4E]">
                          <span className="line-clamp-1">
                            {i.quantity}x {i.productName} ({i.selectedColor})
                          </span>
                          <span className="font-medium text-[#2D2527]">
                            {formatPKR(i.price * i.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Courier Tracking */}
                    {o.courierTrackingNumber && (
                      <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E5C365]/40 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#9A7B1C]" />
                          <span>
                            <strong>{o.courierName || 'Courier'}:</strong> Tracking # {o.courierTrackingNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* CUSTOM REQUESTS TAB */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {loadingCustom ? (
                <p className="text-xs text-[#7D6E73] py-8 text-center">Loading custom requests...</p>
              ) : customRequests.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto opacity-50" />
                  <p className="font-serif-luxury text-lg text-[#2D2527]">No custom requests yet</p>
                  <p className="text-xs text-[#7D6E73]">Commission bespoke bouquets, characters, or wedding favors.</p>
                </div>
              ) : (
                customRequests.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F5EFEB]">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#9A7B1C]">
                          #{c.requestNumber}
                        </span>
                        <span className="text-[11px] text-[#7D6E73] ml-2">
                          {c.productType}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5DADB] text-[#D4737B] uppercase">
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#574A4E]">
                      <p><strong>Colors:</strong> {c.preferredColours}</p>
                      <p><strong>Size/Qty:</strong> {c.size} (Qty: {c.quantity})</p>
                      <p><strong>Initial Budget:</strong> {formatPKR(c.budgetPKR)}</p>
                      <p>
                        <strong>Target Deadline:</strong> {c.deadline || 'Flexible'}
                      </p>
                    </div>

                    {c.quotationPricePKR && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <p className="font-bold">Artisan Price Quotation:</p>
                        <p className="text-sm font-bold text-[#2D2527] mt-0.5">
                          {formatPKR(c.quotationPricePKR)}
                        </p>
                        {c.adminNotes && <p className="text-xs text-[#574A4E] mt-1">{c.adminNotes}</p>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistProducts.length === 0 ? (
                <div className="sm:col-span-2 text-center py-12 space-y-2">
                  <Heart className="w-10 h-10 text-[#D4737B] mx-auto opacity-40" />
                  <p className="font-serif-luxury text-lg text-[#2D2527]">Wishlist is currently empty</p>
                  <p className="text-xs text-[#7D6E73]">Tap the heart icon on any design to save it here.</p>
                </div>
              ) : (
                wishlistProducts.map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-white border border-[#EFE7DE] flex gap-3 items-center">
                    <img src={p.images[0] || ''} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#2D2527] truncate">{p.name}</h4>
                      <p className="font-serif-luxury font-bold text-sm text-[#2D2527]">{formatPKR(p.price)}</p>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => {
                            addItem(p, 1);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-[#2D2527] text-white text-[10px] font-semibold"
                        >
                          Add to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE / SAVED ADDRESS TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg mx-auto">
              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {profileSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs text-[#2D2527]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">Phone (Pakistan)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs text-[#2D2527]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore / Karachi"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs text-[#2D2527]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">Default Delivery Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Street, Area"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs text-[#2D2527]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2D2527] text-white text-xs font-semibold hover:bg-[#45383B] disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
