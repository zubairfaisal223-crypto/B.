import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Clock,
  Sparkles,
  AlertTriangle,
  Package,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Download,
  Settings,
  Tag,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  RefreshCw,
  LogOut,
  X,
  Layers,
  ArrowRight,
  Calculator,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { Product, Order, CustomRequest, Category, Coupon, Review, StoreSettings } from '../types';
import { formatPKR, calculateCraftProfit } from '../utils/pricing';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsChanged?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onProductsChanged,
}) => {
  const { user, token, logout, isAdmin } = useAuth();
  const { refreshSettings } = useStoreSettings();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'custom' | 'categories' | 'coupons' | 'reviews' | 'settings'
  >('overview');

  // Overview Data
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newCourierName, setNewCourierName] = useState('Leopards Courier');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Custom Requests
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [selectedCustomRequest, setSelectedCustomRequest] = useState<CustomRequest | null>(null);
  const [quoteInputPKR, setQuoteInputPKR] = useState<number>(0);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [convertingRequest, setConvertingRequest] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(2000);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);

  // Settings CMS
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  const fetchOverview = async () => {
    if (!token) return;
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/custom-requests/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomRequests(data);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const fetchCoupons = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/reviews/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchOverview();
      fetchProducts();
      fetchOrders();
      fetchCustomRequests();
      fetchCategories();
      fetchCoupons();
      fetchReviews();
      fetchSettings();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#FDFBF7] p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-red-200">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2527]">Unauthorized Access</h2>
          <p className="text-xs text-[#7D6E73]">
            This portal is restricted to authorized store administrators with verified credentials.
          </p>
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-[#2D2527] text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIONS ---

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!token) return;
    const isEdit = Boolean(productData.id);
    const url = isEdit ? `/api/products/${productData.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        fetchProducts();
        fetchOverview();
        if (onProductsChanged) onProductsChanged();
        setEditingProduct(null);
        setIsCreatingProduct(false);
      }
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
        if (onProductsChanged) onProductsChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    if (!token) return;
    setUpdatingOrderStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: status,
          courierTrackingNumber: newTrackingNumber || selectedOrder?.courierTrackingNumber,
          courierName: newCourierName || selectedOrder?.courierName,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder(updated);
        fetchOrders();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const handleConvertCustomRequest = async (crId: string) => {
    if (!token) return;
    setConvertingRequest(true);
    try {
      const res = await fetch(`/api/custom-requests/${crId}/convert-to-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quotationPricePKR: quoteInputPKR,
        }),
      });

      if (res.ok) {
        fetchCustomRequests();
        fetchOrders();
        fetchOverview();
        setSelectedCustomRequest(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingRequest(false);
    }
  };

  const handleUpdateCustomRequest = async (crId: string, updates: Partial<CustomRequest>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/custom-requests/${crId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchCustomRequests();
        setSelectedCustomRequest(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCategoryName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDesc,
          image: newCategoryImage,
        }),
      });
      if (res.ok) {
        setNewCategoryName('');
        setNewCategoryDesc('');
        setNewCategoryImage('');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCouponCode) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: newCouponCode,
          discountType: newCouponType,
          value: newCouponValue,
          minOrderAmount: newCouponMin,
          isActive: true,
        }),
      });
      if (res.ok) {
        setNewCouponCode('');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !storeSettings) return;
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeSettings),
      });
      if (res.ok) {
        setSettingsSuccess('Store settings updated successfully!');
        refreshSettings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.orderStatus === orderStatusFilter;
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex bg-[#FAF6F0] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#2D2527] text-[#FAF6F0] flex flex-col justify-between hidden md:flex border-r border-[#45383B]">
        <div>
          <div className="p-6 border-b border-[#45383B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E5C365] text-[#2D2527] flex items-center justify-center font-serif-luxury font-bold text-lg">
                B.
              </div>
              <div>
                <h1 className="font-serif-luxury text-base font-bold text-white">Boutique Admin</h1>
                <p className="text-[10px] text-[#E5C365]">Full Management Portal</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview & KPIs
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Products & Costing
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders & Tracking
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Custom Requests
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Categories
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'coupons'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" /> Coupons & Discounts
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Review Moderation
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#E5C365] text-[#2D2527]'
                  : 'text-[#FAF6F0]/80 hover:bg-[#45383B] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" /> Store Settings & CMS
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#45383B] space-y-2">
          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-[#45383B] text-xs font-semibold text-white hover:bg-[#574A4E] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Exit to Storefront
          </button>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl border border-red-500/40 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#EFE7DE] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif-luxury text-xl font-bold text-[#2D2527] capitalize">
              {activeTab} Management
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export-orders.csv"
              className="py-1.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs font-semibold text-[#2D2527] hover:border-[#C59B27] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
              aria-label="Close admin dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Content View */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#7D6E73] font-bold">Total Sales</span>
                  <p className="font-serif-luxury text-2xl font-bold text-[#2D2527] mt-1">
                    {formatPKR(overview?.totalSales || 0)}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">All non-cancelled orders</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#7D6E73] font-bold">Total Orders</span>
                  <p className="font-serif-luxury text-2xl font-bold text-[#2D2527] mt-1">
                    {overview?.totalOrders || 0}
                  </p>
                  <span className="text-[10px] text-[#9A7B1C] font-medium">{overview?.pendingOrders || 0} pending review</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#7D6E73] font-bold">Custom Requests</span>
                  <p className="font-serif-luxury text-2xl font-bold text-[#2D2527] mt-1">
                    {overview?.pendingCustom || 0}
                  </p>
                  <span className="text-[10px] text-[#D4737B] font-medium">Require price quotation</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#7D6E73] font-bold">Low Stock Warning</span>
                  <p className="font-serif-luxury text-2xl font-bold text-amber-700 mt-1">
                    {overview?.lowStockCount || 0}
                  </p>
                  <span className="text-[10px] text-[#7D6E73]">Ready-made items &le; 5 units</span>
                </div>
              </div>

              {/* Crochet Cost & Profit Analysis (Authorized Admin Only) */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2D2527] to-[#45383B] text-white shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#E5C365]" />
                    <h3 className="font-serif-luxury text-xl font-bold">
                      Artisan Craft Cost & Profit Breakdown
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#E5C365]/20 text-[#E5C365]">
                    Confidential Admin Analytics
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <span className="text-[11px] text-white/70">Gross Product Sales</span>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {formatPKR(overview?.profitReport?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/70">Estimated Craft Costs</span>
                    <p className="text-lg font-bold text-red-300 mt-0.5">
                      {formatPKR(overview?.profitReport?.totalEstimatedCost || 0)}
                    </p>
                    <span className="text-[10px] text-white/50">Yarn + Labour + Packaging</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/70">Net Craft Profit</span>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">
                      {formatPKR(overview?.profitReport?.estimatedProfit || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/70">Average Margin</span>
                    <p className="text-lg font-bold text-[#E5C365] mt-0.5">
                      {overview?.profitReport?.marginPercent || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs">
                <h3 className="font-serif-luxury text-lg font-bold text-[#2D2527] mb-4">
                  Recent Orders
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase tracking-wider text-[#7D6E73] border-b border-[#F5EFEB]">
                      <tr>
                        <th className="pb-2">Order #</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">City</th>
                        <th className="pb-2">Total</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EFEB]">
                      {(overview?.recentOrders || []).map((o: Order) => (
                        <tr key={o.id}>
                          <td className="py-2.5 font-mono font-bold text-[#9A7B1C]">
                            {o.orderNumber}
                          </td>
                          <td className="py-2.5 font-medium text-[#2D2527]">{o.customerName}</td>
                          <td className="py-2.5 text-[#574A4E]">{o.city}</td>
                          <td className="py-2.5 font-bold text-[#2D2527]">{formatPKR(o.total)}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 uppercase">
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setActiveTab('orders');
                              }}
                              className="text-xs text-[#9A7B1C] hover:underline"
                            >
                              Manage &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EFE7DE] text-xs text-[#2D2527]"
                  />
                  <Search className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: '',
                      name: '',
                      slug: '',
                      description: '',
                      price: 2500,
                      category: categories[0]?.id || 'cat-flowers',
                      sku: `BC-${Math.floor(100 + Math.random() * 900)}`,
                      colors: ['Blush Pink', 'Cream'],
                      sizes: ['Standard'],
                      stock: 10,
                      status: 'active',
                      isFeatured: false,
                      isBestSeller: false,
                      isNewArrival: true,
                      isReadyMade: true,
                      estimatedProductionDays: 2,
                      images: [
                        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
                      ],
                      yarnType: '100% Milk Cotton Yarn',
                      dimensions: '',
                      careInstructions: 'Spot clean with cool water.',
                      internalCosts: {
                        yarnCost: 400,
                        labourCost: 800,
                        packagingCost: 200,
                        deliveryEstimateCost: 200,
                      },
                      createdAt: new Date().toISOString(),
                    });
                    setIsCreatingProduct(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#2D2527] text-white text-xs font-semibold hover:bg-[#45383B] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#E5C365]" /> Add New Crochet Design
                </button>
              </div>

              {/* Product Modal for Add / Edit */}
              {(isCreatingProduct || editingProduct) && (
                <div className="p-6 rounded-3xl bg-white border border-[#E5C365] shadow-lg space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#F5EFEB]">
                    <h3 className="font-serif-luxury text-xl font-bold text-[#2D2527]">
                      {editingProduct?.id ? 'Edit Crochet Product' : 'Add New Crochet Creation'}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsCreatingProduct(false);
                      }}
                      className="text-[#7D6E73] hover:text-[#2D2527]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingProduct) handleSaveProduct(editingProduct);
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={editingProduct?.name || ''}
                        onChange={(e) =>
                          setEditingProduct((prev) => (prev ? { ...prev, name: e.target.value } : null))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Selling Price (PKR)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct?.price || 0}
                        onChange={(e) =>
                          setEditingProduct((prev) =>
                            prev ? { ...prev, price: Number(e.target.value) } : null
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Category</label>
                      <select
                        value={editingProduct?.category}
                        onChange={(e) =>
                          setEditingProduct((prev) => (prev ? { ...prev, category: e.target.value } : null))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Product SKU</label>
                      <input
                        type="text"
                        value={editingProduct?.sku || ''}
                        onChange={(e) =>
                          setEditingProduct((prev) => (prev ? { ...prev, sku: e.target.value } : null))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>

                    {/* Ready Made vs Made to Order */}
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={editingProduct?.isReadyMade ?? true}
                          onChange={(e) =>
                            setEditingProduct((prev) =>
                              prev ? { ...prev, isReadyMade: e.target.checked } : null
                            )
                          }
                          className="rounded text-[#2D2527]"
                        />
                        <span>Ready-Made (In Stock)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={editingProduct?.isFeatured ?? false}
                          onChange={(e) =>
                            setEditingProduct((prev) =>
                              prev ? { ...prev, isFeatured: e.target.checked } : null
                            )
                          }
                          className="rounded text-[#2D2527]"
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">
                        Stock Quantity (or Made-to-order Production Days)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Stock Quantity"
                          value={editingProduct?.stock ?? 0}
                          onChange={(e) =>
                            setEditingProduct((prev) =>
                              prev ? { ...prev, stock: Number(e.target.value) } : null
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                        />
                        <input
                          type="number"
                          placeholder="Prod. Days"
                          value={editingProduct?.estimatedProductionDays ?? 2}
                          onChange={(e) =>
                            setEditingProduct((prev) =>
                              prev ? { ...prev, estimatedProductionDays: Number(e.target.value) } : null
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                        />
                      </div>
                    </div>

                    {/* Internal Cost Tracking Box */}
                    <div className="md:col-span-2 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5C365]/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#2D2527] flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-[#9A7B1C]" />
                          Artisan Internal Cost Tracking (Admin Only)
                        </span>
                        {editingProduct && (
                          <span className="font-bold text-emerald-800">
                            Est. Profit: {formatPKR(
                              editingProduct.price -
                              ((editingProduct.internalCosts?.yarnCost || 0) +
                                (editingProduct.internalCosts?.labourCost || 0) +
                                (editingProduct.internalCosts?.packagingCost || 0) +
                                (editingProduct.internalCosts?.deliveryEstimateCost || 0))
                            )}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] text-[#7D6E73]">Yarn/Materials (PKR)</label>
                          <input
                            type="number"
                            value={editingProduct?.internalCosts?.yarnCost || 0}
                            onChange={(e) =>
                              setEditingProduct((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      internalCosts: {
                                        ...prev.internalCosts,
                                        yarnCost: Number(e.target.value),
                                      },
                                    }
                                  : null
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE7DE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#7D6E73]">Labour (PKR)</label>
                          <input
                            type="number"
                            value={editingProduct?.internalCosts?.labourCost || 0}
                            onChange={(e) =>
                              setEditingProduct((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      internalCosts: {
                                        ...prev.internalCosts,
                                        labourCost: Number(e.target.value),
                                      },
                                    }
                                  : null
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE7DE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#7D6E73]">Packaging (PKR)</label>
                          <input
                            type="number"
                            value={editingProduct?.internalCosts?.packagingCost || 0}
                            onChange={(e) =>
                              setEditingProduct((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      internalCosts: {
                                        ...prev.internalCosts,
                                        packagingCost: Number(e.target.value),
                                      },
                                    }
                                  : null
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE7DE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#7D6E73]">Est. Delivery (PKR)</label>
                          <input
                            type="number"
                            value={editingProduct?.internalCosts?.deliveryEstimateCost || 0}
                            onChange={(e) =>
                              setEditingProduct((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      internalCosts: {
                                        ...prev.internalCosts,
                                        deliveryEstimateCost: Number(e.target.value),
                                      },
                                    }
                                  : null
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE7DE]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold mb-1">Image URL</label>
                      <input
                        type="url"
                        value={editingProduct?.images[0] || ''}
                        onChange={(e) =>
                          setEditingProduct((prev) =>
                            prev ? { ...prev, images: [e.target.value] } : null
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingProduct?.description || ''}
                        onChange={(e) =>
                          setEditingProduct((prev) =>
                            prev ? { ...prev, description: e.target.value } : null
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setIsCreatingProduct(false);
                        }}
                        className="py-2 px-4 rounded-xl border border-[#EFE7DE] text-[#7D6E73]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-6 rounded-xl bg-[#2D2527] text-white font-semibold"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-[#EFE7DE] overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF6F0] text-[10px] uppercase text-[#7D6E73] border-b border-[#EFE7DE]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Selling Price</th>
                      <th className="p-3">Cost Breakdown</th>
                      <th className="p-3">Stock / Mode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFEB]">
                    {filteredProducts.map((p) => {
                      const cost =
                        (p.internalCosts?.yarnCost || 0) +
                        (p.internalCosts?.labourCost || 0) +
                        (p.internalCosts?.packagingCost || 0);
                      const profit = p.price - cost;
                      return (
                        <tr key={p.id}>
                          <td className="p-3 flex items-center gap-3">
                            <img src={p.images[0] || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-[#2D2527]">{p.name}</p>
                              <span className="text-[10px] text-[#7D6E73]">{p.category}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono">{p.sku}</td>
                          <td className="p-3 font-bold text-[#2D2527]">{formatPKR(p.price)}</td>
                          <td className="p-3">
                            <div className="text-[10px] text-[#574A4E]">
                              <span>Cost: {formatPKR(cost)}</span>
                              <span className="block font-bold text-emerald-700">Profit: {formatPKR(profit)}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {p.isReadyMade ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 font-bold">
                                {p.stock} units
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-800 font-bold">
                                Made to order ({p.estimatedProductionDays}d)
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 font-bold uppercase">
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsCreatingProduct(false);
                              }}
                              className="p-1.5 rounded-lg text-[#9A7B1C] hover:bg-[#FAF6F0]"
                              aria-label="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              aria-label="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1.5 overflow-x-auto text-xs font-semibold">
                  {['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`py-1.5 px-3 rounded-xl capitalize transition-all ${
                          orderStatusFilter === st
                            ? 'bg-[#2D2527] text-white'
                            : 'bg-white text-[#7D6E73] border border-[#EFE7DE]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Orders List */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFE7DE] overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-[#F5EFEB]">
                    <span className="text-xs font-bold text-[#2D2527]">
                      Showing {filteredOrders.length} Orders
                    </span>
                  </div>

                  <div className="divide-y divide-[#F5EFEB] max-h-[70vh] overflow-y-auto">
                    {filteredOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setSelectedOrder(o);
                          setNewTrackingNumber(o.courierTrackingNumber || '');
                          setNewCourierName(o.courierName || 'Leopards Courier');
                        }}
                        className={`p-4 cursor-pointer hover:bg-[#FAF6F0] transition-colors ${
                          selectedOrder?.id === o.id ? 'bg-[#FAF6F0] border-l-4 border-[#C59B27]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#9A7B1C]">
                              #{o.orderNumber}
                            </span>
                            <h4 className="text-xs font-bold text-[#2D2527] mt-0.5">
                              {o.customerName}
                            </h4>
                            <p className="text-[11px] text-[#7D6E73]">{o.city} • {o.phone}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs text-[#2D2527] block">
                              {formatPKR(o.total)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-100 text-gray-800">
                              {o.orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Order Detail Drawer */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EFE7DE] p-5 shadow-xs">
                  {selectedOrder ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-3 border-b border-[#F5EFEB]">
                        <div>
                          <span className="text-xs text-[#7D6E73]">Order Details</span>
                          <h3 className="font-mono text-base font-bold text-[#9A7B1C]">
                            #{selectedOrder.orderNumber}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF6F0] text-[#2D2527] border border-[#EFE7DE] uppercase">
                          {selectedOrder.orderStatus}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-[#574A4E]">
                        <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                        <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                        <p><strong>Email:</strong> {selectedOrder.email}</p>
                        <p><strong>Address:</strong> {selectedOrder.deliveryAddress}, {selectedOrder.city}</p>
                        {selectedOrder.orderNotes && (
                          <p className="p-2 rounded-lg bg-[#FAF6F0] text-[11px] mt-1">
                            <strong>Note:</strong> {selectedOrder.orderNotes}
                          </p>
                        )}
                      </div>

                      {/* Items */}
                      <div className="border-t border-[#F5EFEB] pt-2">
                        <span className="text-xs font-bold text-[#2D2527]">Ordered Items</span>
                        <div className="space-y-2 mt-2">
                          {selectedOrder.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-[#574A4E]">
                              <span>{it.quantity}x {it.productName} ({it.selectedColor})</span>
                              <span className="font-semibold text-[#2D2527]">{formatPKR(it.price * it.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Update Dropdown */}
                      <div className="border-t border-[#F5EFEB] pt-3 space-y-2">
                        <label className="block text-xs font-bold text-[#2D2527]">
                          Update Order Status:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'] as Order['orderStatus'][]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                                disabled={updatingOrderStatus}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                                  selectedOrder.orderStatus === st
                                    ? 'bg-[#2D2527] text-white'
                                    : 'bg-[#FAF6F0] text-[#574A4E] hover:bg-[#EFE7DE]'
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Courier Tracking Inputs */}
                      <div className="border-t border-[#F5EFEB] pt-3 space-y-2">
                        <label className="block text-xs font-bold text-[#2D2527]">
                          Courier & Tracking Information:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Courier (e.g. Leopards)"
                            value={newCourierName}
                            onChange={(e) => setNewCourierName(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Tracking #"
                            value={newTrackingNumber}
                            onChange={(e) => setNewTrackingNumber(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs"
                          />
                        </div>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus)
                          }
                          className="w-full py-1.5 px-3 rounded-lg bg-[#2D2527] text-white text-xs font-semibold"
                        >
                          Save Tracking Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#7D6E73] text-center py-16">
                      Select an order from the list to view full details and update tracking.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CUSTOM REQUESTS TAB */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFE7DE] overflow-hidden shadow-xs divide-y divide-[#F5EFEB]">
                  <div className="p-4 bg-[#FAF6F0] flex justify-between items-center">
                    <span className="text-xs font-bold text-[#2D2527]">
                      Custom Crochet Inquiries ({customRequests.length})
                    </span>
                  </div>

                  {customRequests.map((cr) => (
                    <div
                      key={cr.id}
                      onClick={() => {
                        setSelectedCustomRequest(cr);
                        setQuoteInputPKR(cr.quotationPricePKR || cr.budgetPKR);
                        setAdminNoteInput(cr.adminNotes || '');
                      }}
                      className={`p-4 cursor-pointer hover:bg-[#FAF6F0] transition-colors ${
                        selectedCustomRequest?.id === cr.id
                          ? 'bg-[#FAF6F0] border-l-4 border-[#C59B27]'
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#9A7B1C]">
                            #{cr.requestNumber}
                          </span>
                          <h4 className="text-xs font-bold text-[#2D2527]">{cr.customerName}</h4>
                          <p className="text-[11px] text-[#7D6E73]">{cr.productType} • {cr.city}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#2D2527]">
                            Budget: {formatPKR(cr.budgetPKR)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#F5DADB] text-[#D4737B] block mt-1">
                            {cr.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Custom Request Action Card */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EFE7DE] p-5 shadow-xs">
                  {selectedCustomRequest ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F5EFEB]">
                        <h3 className="font-mono text-sm font-bold text-[#9A7B1C]">
                          #{selectedCustomRequest.requestNumber}
                        </h3>
                        <span className="text-xs font-semibold text-[#574A4E]">
                          {selectedCustomRequest.customerName}
                        </span>
                      </div>

                      {selectedCustomRequest.referenceImage && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#EFE7DE]">
                          <img
                            src={selectedCustomRequest.referenceImage}
                            alt="Reference"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="text-xs text-[#574A4E] space-y-1">
                        <p><strong>Item:</strong> {selectedCustomRequest.productType}</p>
                        <p><strong>Colors:</strong> {selectedCustomRequest.preferredColours}</p>
                        <p><strong>Size/Dimensions:</strong> {selectedCustomRequest.size}</p>
                        <p><strong>Quantity:</strong> {selectedCustomRequest.quantity}</p>
                        <p><strong>Deadline:</strong> {selectedCustomRequest.deadline || 'None'}</p>
                        <p><strong>Phone:</strong> {selectedCustomRequest.phone}</p>
                        {selectedCustomRequest.additionalInstructions && (
                          <p className="p-2 rounded-lg bg-[#FAF6F0] text-[11px]">
                            <strong>Instructions:</strong> {selectedCustomRequest.additionalInstructions}
                          </p>
                        )}
                      </div>

                      {/* Quotation & Acceptance Form */}
                      <div className="border-t border-[#F5EFEB] pt-3 space-y-2">
                        <label className="block text-xs font-bold text-[#2D2527]">
                          Artisan Quotation Price (PKR):
                        </label>
                        <input
                          type="number"
                          value={quoteInputPKR}
                          onChange={(e) => setQuoteInputPKR(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs font-bold text-[#2D2527]"
                        />

                        <label className="block text-xs font-bold text-[#2D2527] pt-1">
                          Admin / Studio Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={adminNoteInput}
                          onChange={(e) => setAdminNoteInput(e.target.value)}
                          placeholder="e.g. Yarn in stock, ready in 4 days..."
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs"
                        />

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() =>
                              handleUpdateCustomRequest(selectedCustomRequest.id, {
                                quotationPricePKR: quoteInputPKR,
                                adminNotes: adminNoteInput,
                                status: 'quotation_sent',
                              })
                            }
                            className="flex-1 py-2 px-3 rounded-xl bg-[#2D2527] text-white text-xs font-semibold"
                          >
                            Send Quotation
                          </button>
                          <button
                            onClick={() => handleConvertCustomRequest(selectedCustomRequest.id)}
                            disabled={convertingRequest}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-semibold"
                          >
                            {convertingRequest ? 'Converting...' : 'Convert to Order'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#7D6E73] text-center py-16">
                      Select a custom request to view reference photo and issue a quotation.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleAddCategory} className="p-5 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs space-y-3">
                <h3 className="font-serif-luxury text-lg font-bold text-[#2D2527]">
                  Add New Product Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Crochet Hairpins)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />
                  <input
                    type="url"
                    placeholder="Cover Image URL"
                    value={newCategoryImage}
                    onChange={(e) => setNewCategoryImage(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />
                  <input
                    type="text"
                    placeholder="Short description"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#2D2527] text-white text-xs font-semibold"
                >
                  Create Category
                </button>
              </form>

              <div className="bg-white rounded-3xl border border-[#EFE7DE] divide-y divide-[#F5EFEB]">
                {categories.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-xs text-[#2D2527]">{c.name}</h4>
                        <p className="text-[11px] text-[#7D6E73]">{c.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleCreateCoupon} className="p-5 rounded-3xl bg-white border border-[#EFE7DE] shadow-xs space-y-3">
                <h3 className="font-serif-luxury text-lg font-bold text-[#2D2527]">
                  Create Promotional Coupon
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="CODE (e.g. EID20)"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] font-mono"
                  />
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed PKR (Rs.)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Discount Value"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />
                  <input
                    type="number"
                    placeholder="Min Order PKR"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#2D2527] text-white text-xs font-semibold"
                >
                  Create Coupon
                </button>
              </form>

              <div className="bg-white rounded-3xl border border-[#EFE7DE] divide-y divide-[#F5EFEB]">
                {coupons.map((cp) => (
                  <div key={cp.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#9A7B1C]">{cp.code}</span>
                      <p className="text-[11px] text-[#574A4E]">
                        {cp.discountType === 'percentage' ? `${cp.value}% off` : formatPKR(cp.value)} (Min Order: {formatPKR(cp.minOrderAmount)})
                      </p>
                    </div>
                    <span className="text-[11px] text-[#7D6E73]">Used: {cp.timesUsed} times</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-4xl">
              <h3 className="font-serif-luxury text-lg font-bold text-[#2D2527]">
                Review Moderation Queue
              </h3>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-white border border-[#EFE7DE] text-xs flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2527]">{r.customerName}</span>
                        <span className="text-[10px] text-[#7D6E73]">{r.customerEmail}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-100">
                          {r.status}
                        </span>
                      </div>
                      <p className="font-semibold text-[#2D2527] mt-1">{r.title}</p>
                      <p className="text-[#574A4E] mt-0.5">{r.comment}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateReviewStatus(r.id, 'approved')}
                          className="py-1 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateReviewStatus(r.id, 'rejected')}
                          className="py-1 px-3 rounded-lg bg-red-600 text-white text-[11px] font-semibold"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && storeSettings && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl text-xs">
              {settingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  {settingsSuccess}
                </div>
              )}

              {/* Announcement Bar */}
              <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#2D2527]">Announcement Bar</h4>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={storeSettings.announcementBar.enabled}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          announcementBar: {
                            ...storeSettings.announcementBar,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#2D2527]"
                    />
                    <span>Show Announcement</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={storeSettings.announcementBar.text}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      announcementBar: {
                        ...storeSettings.announcementBar,
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                />
              </div>

              {/* Hero Banner CMS */}
              <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] space-y-3">
                <h4 className="font-bold text-sm text-[#2D2527]">Homepage Hero Section</h4>
                <div className="space-y-2">
                  <label className="block font-semibold">Hero Headline</label>
                  <input
                    type="text"
                    value={storeSettings.heroBanner.headline}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        heroBanner: {
                          ...storeSettings.heroBanner,
                          headline: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />

                  <label className="block font-semibold">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={storeSettings.heroBanner.subheadline}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        heroBanner: {
                          ...storeSettings.heroBanner,
                          subheadline: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />

                  <label className="block font-semibold">Hero Banner Image URL</label>
                  <input
                    type="url"
                    value={storeSettings.heroBanner.bannerImage}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        heroBanner: {
                          ...storeSettings.heroBanner,
                          bannerImage: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                  />
                </div>
              </div>

              {/* Delivery Rules */}
              <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] space-y-3">
                <h4 className="font-bold text-sm text-[#2D2527]">Delivery Charges Across Pakistan</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold">Standard Delivery Fee (PKR)</label>
                    <input
                      type="number"
                      value={storeSettings.deliveryRules.standardFee}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          deliveryRules: {
                            ...storeSettings.deliveryRules,
                            standardFee: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Free Delivery Above (PKR)</label>
                    <input
                      type="number"
                      value={storeSettings.deliveryRules.freeDeliveryThreshold}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          deliveryRules: {
                            ...storeSettings.deliveryRules,
                            freeDeliveryThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="p-5 rounded-3xl bg-white border border-[#EFE7DE] space-y-3">
                <h4 className="font-bold text-sm text-[#2D2527]">Mobile Wallet & COD Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={storeSettings.paymentSettings.codEnabled}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          paymentSettings: {
                            ...storeSettings.paymentSettings,
                            codEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#2D2527]"
                    />
                    <span>Enable Cash on Delivery (COD)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold">JazzCash Account Number</label>
                      <input
                        type="text"
                        value={storeSettings.paymentSettings.jazzcashAccountNumber}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            paymentSettings: {
                              ...storeSettings.paymentSettings,
                              jazzcashAccountNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold">Easypaisa Account Number</label>
                      <input
                        type="text"
                        value={storeSettings.paymentSettings.easypaisaAccountNumber}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            paymentSettings: {
                              ...storeSettings.paymentSettings,
                              easypaisaAccountNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-8 rounded-2xl bg-[#2D2527] text-white font-semibold text-sm hover:bg-[#45383B] shadow-md"
              >
                Save Store Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
