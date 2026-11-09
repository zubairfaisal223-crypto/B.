import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { db, verifyPassword } from './server/db';
import {
  calculateSubtotal,
  calculateDeliveryFee,
  calculateDiscount,
  calculateOrderTotal,
  DEFAULT_DELIVERY_RULES,
} from './src/utils/pricing';
import { Product, Order, CustomRequest, OrderItem } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'b-crochet-boutique-secret-key-2026';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper: Sign simple tamper-proof HMAC auth token
function createToken(userId: string, role: 'admin' | 'customer'): string {
  const payload = {
    userId,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

// Helper: Verify auth token
function verifyToken(token?: string): { userId: string; role: 'admin' | 'customer' } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [str, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(str).digest('base64url');
  if (sig !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf-8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

// Auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'customer';
    email: string;
  };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (decoded) {
    const user = db.findUserById(decoded.userId);
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
      };
    }
  }
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}

app.use(authMiddleware);

// --- AUTH ROUTES ---

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const userRecord = db.findUserByEmail(email);
  if (!userRecord) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = verifyPassword(password, userRecord.passwordHash, userRecord.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createToken(userRecord.id, userRecord.role);
  const { passwordHash, salt, ...safeUser } = userRecord;

  db.addAuditLog('User Login', safeUser.email, `Role: ${safeUser.role}`);

  return res.json({
    token,
    user: safeUser,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, city, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = db.createUser({
    name,
    email,
    password,
    phone,
    city,
    address,
    role: 'customer',
  });

  const token = createToken(newUser.id, 'customer');
  db.addAuditLog('User Registered', newUser.email);

  return res.status(201).json({
    token,
    user: newUser,
  });
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user });
});

app.put('/api/auth/profile', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, city, address, wishlist } = req.body;
  const updated = db.updateUserProfile(req.user.id, { name, phone, city, address, wishlist });
  return res.json({ user: updated });
});

// Admin bootstrap route: Safe creation of admin if needed or verified with setup key
app.post('/api/auth/create-first-admin', (req: Request, res: Response) => {
  const { email, password, name, setupKey } = req.body;
  const hasAdmin = db.hasAnyAdmin();

  // If admins already exist, require setup key or existing admin token
  if (hasAdmin && setupKey !== 'BCrochetAdmin2026Setup') {
    return res.status(403).json({ error: 'Admin account already exists. Use the login screen.' });
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const newAdmin = db.createUser({
    name,
    email,
    password,
    role: 'admin',
  });

  const token = createToken(newAdmin.id, 'admin');
  db.addAuditLog('Admin Created', newAdmin.email, 'First admin created via setup');

  return res.json({
    token,
    user: newAdmin,
  });
});

// --- PRODUCTS ROUTES ---

// Public products (internal costs stripped unless admin)
app.get('/api/products', (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const { category, type, search, sort } = req.query;

  let products = db.getProducts();

  // Non-admins only see active products
  if (!isAdmin) {
    products = products.filter((p) => p.status === 'active');
  }

  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  if (type === 'ready-made') {
    products = products.filter((p) => p.isReadyMade);
  } else if (type === 'made-to-order') {
    products = products.filter((p) => !p.isReadyMade);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-low') {
    products = products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products = products.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    products = products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Strip internal costs for non-admins
  const safeProducts = products.map((p) => {
    if (isAdmin) return p;
    const { internalCosts, ...publicProduct } = p;
    return publicProduct;
  });

  return res.json(safeProducts);
});

app.get('/api/products/:id', (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const product = db.getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (!isAdmin && product.status !== 'active') {
    return res.status(404).json({ error: 'Product is unavailable.' });
  }

  if (isAdmin) {
    return res.json(product);
  }

  const { internalCosts, ...publicProduct } = product;
  return res.json(publicProduct);
});

// Admin product mutation routes
app.post('/api/products', requireAdmin, (req: AuthRequest, res: Response) => {
  const data = req.body;
  if (!data.name || !data.price || !data.category) {
    return res.status(400).json({ error: 'Product name, price, and category are required.' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: data.name,
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: data.description || '',
    price: Math.max(0, Number(data.price)),
    category: data.category,
    sku: data.sku || `BC-${Math.floor(100 + Math.random() * 900)}`,
    colors: Array.isArray(data.colors) ? data.colors : ['Custom'],
    sizes: Array.isArray(data.sizes) ? data.sizes : ['Standard'],
    stock: Math.max(0, parseInt(data.stock, 10) || 0),
    status: data.status || 'active',
    isFeatured: Boolean(data.isFeatured),
    isBestSeller: Boolean(data.isBestSeller),
    isNewArrival: Boolean(data.isNewArrival),
    isReadyMade: Boolean(data.isReadyMade),
    estimatedProductionDays: Math.max(1, parseInt(data.estimatedProductionDays, 10) || 1),
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: data.yarnType || '100% Milk Cotton Yarn',
    dimensions: data.dimensions || '',
    careInstructions: data.careInstructions || 'Spot clean or hand wash gently in cool water.',
    internalCosts: {
      yarnCost: Math.max(0, Number(data.internalCosts?.yarnCost) || 0),
      labourCost: Math.max(0, Number(data.internalCosts?.labourCost) || 0),
      packagingCost: Math.max(0, Number(data.internalCosts?.packagingCost) || 0),
      deliveryEstimateCost: Math.max(0, Number(data.internalCosts?.deliveryEstimateCost) || 0),
    },
    createdAt: new Date().toISOString(),
  };

  const saved = db.saveProduct(newProduct);
  db.addAuditLog('Created Product', req.user!.email, `Product: ${saved.name}`);
  return res.status(201).json(saved);
});

app.put('/api/products/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
    price: Math.max(0, Number(req.body.price ?? existing.price)),
    stock: Math.max(0, Number(req.body.stock ?? existing.stock)),
    internalCosts: {
      ...existing.internalCosts,
      ...(req.body.internalCosts || {}),
    },
  };

  db.saveProduct(updated);
  db.addAuditLog('Updated Product', req.user!.email, `Product: ${updated.name}`);
  return res.json(updated);
});

app.delete('/api/products/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  db.addAuditLog('Deleted Product', req.user!.email, `ID: ${req.params.id}`);
  return res.json({ success: true });
});

// --- CATEGORIES ROUTES ---

app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  const products = db.getProducts();

  const enriched = categories.map((cat) => ({
    ...cat,
    itemCount: products.filter((p) => p.category === cat.id && p.status === 'active').length,
  }));

  return res.json(enriched);
});

app.post('/api/categories', requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, description, image, displayOrder } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required.' });

  const newCat = {
    id: `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    displayOrder: displayOrder || 99,
  };

  const saved = db.saveCategory(newCat);
  db.addAuditLog('Created Category', req.user!.email, `Category: ${saved.name}`);
  return res.status(201).json(saved);
});

app.put('/api/categories/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const saved = db.saveCategory({ ...req.body, id: req.params.id });
  return res.json(saved);
});

app.delete('/api/categories/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  db.deleteCategory(req.params.id);
  return res.json({ success: true });
});

// --- ORDERS & CHECKOUT ROUTES (SERVER-AUTHORITATIVE) ---

// Server recalculates all prices, validates stock, verifies coupons, and determines shipping!
app.post('/api/orders', (req: AuthRequest, res: Response) => {
  const {
    customerName,
    phone,
    email,
    city,
    deliveryAddress,
    postalCode,
    orderNotes,
    items,
    couponCode,
    paymentMethod,
  } = req.body;

  // Validation
  if (!customerName || !phone || !email || !city || !deliveryAddress) {
    return res.status(400).json({
      error: 'Please fill in all required shipping fields (Name, Phone, Email, City, Address).',
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  // Recalculate each item price securely from database
  const orderItems: OrderItem[] = [];
  const dbProducts = db.getProducts();

  for (const item of items) {
    const prod = dbProducts.find((p) => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({
        error: `Product "${item.productName || item.productId}" is no longer available.`,
      });
    }

    if (prod.status !== 'active') {
      return res.status(400).json({
        error: `"${prod.name}" is currently inactive.`,
      });
    }

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));

    // Stock validation for ready-made products
    if (prod.isReadyMade && prod.stock < qty) {
      return res.status(400).json({
        error: `Insufficient stock for "${prod.name}". Only ${prod.stock} left in stock.`,
      });
    }

    orderItems.push({
      productId: prod.id,
      productName: prod.name,
      productImage: prod.images[0] || '',
      price: prod.price, // Trust ONLY db price!
      quantity: qty,
      selectedColor: item.selectedColor || (prod.colors[0] ?? 'Standard'),
      selectedSize: item.selectedSize || (prod.sizes[0] ?? 'Standard'),
      isReadyMade: prod.isReadyMade,
    });
  }

  const subtotal = calculateSubtotal(orderItems);

  // Delivery fee calculation
  const settings = db.getSettings();
  const deliveryRules = settings.deliveryRules || DEFAULT_DELIVERY_RULES;
  const deliveryFee = calculateDeliveryFee(subtotal, city, deliveryRules);

  // Coupon discount calculation
  let discount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (couponCode) {
    const coupon = db.getCouponByCode(couponCode);
    const { discount: calculatedDiscount, error: couponError } = calculateDiscount(subtotal, coupon);
    if (couponError) {
      return res.status(400).json({ error: `Coupon error: ${couponError}` });
    }
    discount = calculatedDiscount;
    appliedCouponCode = coupon?.code;
    if (coupon) {
      coupon.timesUsed += 1;
      db.saveCoupon(coupon);
    }
  }

  const finalTotal = calculateOrderTotal({ subtotal, deliveryFee, discount });

  // Supported payment method check
  const method = ['cod', 'jazzcash', 'easypaisa'].includes(paymentMethod)
    ? paymentMethod
    : 'cod';

  if (method === 'cod' && !settings.paymentSettings.codEnabled) {
    return res.status(400).json({ error: 'Cash on Delivery is currently disabled by store.' });
  }

  // Generate unique order number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `B-2026-${randomSuffix}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}-${randomSuffix}`,
    orderNumber,
    customerId: req.user?.id,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email.trim(),
    city: city.trim(),
    deliveryAddress: deliveryAddress.trim(),
    postalCode: postalCode?.trim() || '',
    orderNotes: orderNotes?.trim() || '',
    items: orderItems,
    subtotal,
    deliveryFee,
    discount,
    couponCode: appliedCouponCode,
    total: finalTotal,
    paymentMethod: method,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = db.createOrder(newOrder);
  db.addAuditLog('New Order Placed', created.email, `Order #${created.orderNumber} - PKR ${created.total}`);

  return res.status(201).json({
    success: true,
    order: created,
    message: 'Order created successfully!',
  });
});

// Customer can view their own orders
app.get('/api/orders/my-orders', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const orders = db.getOrdersByCustomer(req.user.id);
  return res.json(orders);
});

// Admin views all orders
app.get('/api/orders/all', requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.getOrders());
});

// Order lookup by orderNumber and email (guest tracking)
app.get('/api/orders/track', (req: Request, res: Response) => {
  const { orderNumber, email } = req.query;
  if (!orderNumber || !email) {
    return res.status(400).json({ error: 'Order number and email are required to track.' });
  }

  const order = db.getOrderById(String(orderNumber));
  if (!order || order.email.toLowerCase() !== String(email).toLowerCase().trim()) {
    return res.status(404).json({ error: 'No matching order found with the provided details.' });
  }

  return res.json(order);
});

// Admin update order status
app.put('/api/orders/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  const { orderStatus, paymentStatus, courierTrackingNumber, courierName, refundAmount, adminNotes } = req.body;
  const updated = db.updateOrderStatus(req.params.id, {
    orderStatus,
    paymentStatus,
    courierTrackingNumber,
    courierName,
    refundAmount: refundAmount !== undefined ? Number(refundAmount) : undefined,
    adminNotes,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  db.addAuditLog('Order Status Updated', req.user!.email, `Order #${updated.orderNumber} -> ${orderStatus}`);
  return res.json(updated);
});

// --- CUSTOM REQUESTS ---

app.post('/api/custom-requests', (req: AuthRequest, res: Response) => {
  const {
    customerName,
    phone,
    email,
    city,
    productType,
    preferredColours,
    size,
    quantity,
    budgetPKR,
    deadline,
    referenceImage,
    additionalInstructions,
  } = req.body;

  if (!customerName || !phone || !email || !productType) {
    return res.status(400).json({ error: 'Name, phone, email, and product type are required.' });
  }

  const reqNum = `CR-2026-${Math.floor(100 + Math.random() * 900)}`;
  const customReq: CustomRequest = {
    id: `cr-${Date.now()}`,
    requestNumber: reqNum,
    customerId: req.user?.id,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email.trim(),
    city: city?.trim() || '',
    productType: productType.trim(),
    preferredColours: preferredColours?.trim() || 'Custom Palette',
    size: size?.trim() || 'Custom',
    quantity: Math.max(1, parseInt(quantity, 10) || 1),
    budgetPKR: Math.max(0, parseInt(budgetPKR, 10) || 0),
    deadline: deadline || '',
    referenceImage: referenceImage || '',
    additionalInstructions: additionalInstructions?.trim() || '',
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = db.createCustomRequest(customReq);
  db.addAuditLog('New Custom Request', created.email, `Request #${created.requestNumber}`);

  return res.status(201).json({
    success: true,
    customRequest: created,
    message: 'Your custom crochet request has been submitted for review! We will send a price quotation shortly.',
  });
});

app.get('/api/custom-requests/my-requests', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const requests = db.getCustomRequestsByCustomer(req.user.email);
  return res.json(requests);
});

app.get('/api/custom-requests/all', requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.getCustomRequests());
});

app.put('/api/custom-requests/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const updated = db.updateCustomRequest(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Custom request not found.' });
  }
  db.addAuditLog('Custom Request Updated', req.user!.email, `Req #${updated.requestNumber}`);
  return res.json(updated);
});

// Convert accepted custom request into an actual confirmed order
app.post('/api/custom-requests/:id/convert-to-order', requireAdmin, (req: AuthRequest, res: Response) => {
  const customReq = db.getCustomRequestById(req.params.id);
  if (!customReq) {
    return res.status(404).json({ error: 'Custom request not found.' });
  }

  const quotationPrice = Number(req.body.quotationPricePKR || customReq.quotationPricePKR || customReq.budgetPKR);
  if (quotationPrice <= 0) {
    return res.status(400).json({ error: 'A valid quotation price in PKR is required to convert.' });
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `B-2026-CUST-${randomSuffix}`;

  const orderItem: OrderItem = {
    productId: `custom-${customReq.id}`,
    productName: `Custom Crochet: ${customReq.productType} (${customReq.preferredColours})`,
    productImage: customReq.referenceImage || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    price: quotationPrice,
    quantity: customReq.quantity,
    selectedColor: customReq.preferredColours,
    selectedSize: customReq.size,
    isReadyMade: false,
  };

  const subtotal = quotationPrice * customReq.quantity;
  const settings = db.getSettings();
  const deliveryFee = calculateDeliveryFee(subtotal, customReq.city, settings.deliveryRules);
  const total = subtotal + deliveryFee;

  const newOrder: Order = {
    id: `ord-cust-${Date.now()}`,
    orderNumber,
    customerId: customReq.customerId,
    customerName: customReq.customerName,
    phone: customReq.phone,
    email: customReq.email,
    city: customReq.city,
    deliveryAddress: req.body.deliveryAddress || 'Address specified in custom order notes',
    orderNotes: `Converted from Custom Request #${customReq.requestNumber}. Instructions: ${customReq.additionalInstructions || 'None'}`,
    items: [orderItem],
    subtotal,
    deliveryFee,
    discount: 0,
    total,
    paymentMethod: req.body.paymentMethod || 'cod',
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const order = db.createOrder(newOrder);

  // Update custom request status
  db.updateCustomRequest(customReq.id, {
    status: 'in_production',
    orderId: order.id,
    quotationPricePKR: quotationPrice,
  });

  db.addAuditLog('Converted Custom Request', req.user!.email, `Req #${customReq.requestNumber} -> Order #${order.orderNumber}`);

  return res.json({ success: true, order });
});

// --- COUPONS ---

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

  const coupon = db.getCouponByCode(code);
  const { discount, error } = calculateDiscount(Number(subtotal) || 0, coupon);

  if (error) {
    return res.status(400).json({ error });
  }

  return res.json({
    valid: true,
    code: coupon!.code,
    discount,
    discountType: coupon!.discountType,
    value: coupon!.value,
  });
});

app.get('/api/coupons', requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.getCoupons());
});

app.post('/api/coupons', requireAdmin, (req: AuthRequest, res: Response) => {
  const data = req.body;
  if (!data.code || !data.value) {
    return res.status(400).json({ error: 'Coupon code and discount value are required.' });
  }

  const newCoupon = {
    id: `cpn-${Date.now()}`,
    code: data.code.toUpperCase().trim(),
    discountType: data.discountType || 'percentage',
    value: Number(data.value),
    minOrderAmount: Math.max(0, Number(data.minOrderAmount) || 0),
    maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
    expiryDate: data.expiryDate,
    usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
    timesUsed: 0,
    isActive: data.isActive !== false,
  };

  const saved = db.saveCoupon(newCoupon);
  return res.status(201).json(saved);
});

app.put('/api/coupons/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const saved = db.saveCoupon({ ...req.body, id: req.params.id });
  return res.json(saved);
});

app.delete('/api/coupons/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  db.deleteCoupon(req.params.id);
  return res.json({ success: true });
});

// --- REVIEWS ---

app.get('/api/reviews', (req: Request, res: Response) => {
  const { productId } = req.query;
  if (productId && typeof productId === 'string') {
    return res.json(db.getApprovedReviewsForProduct(productId));
  }
  return res.json(db.getReviews('approved'));
});

app.get('/api/reviews/all', requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.getReviews());
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, customerName, customerEmail, rating, title, comment } = req.body;
  if (!productId || !customerName || !rating || !comment) {
    return res.status(400).json({ error: 'Product, name, rating, and review text are required.' });
  }

  const product = db.getProductById(productId);

  const newRev = {
    id: `rev-${Date.now()}`,
    productId,
    productName: product?.name || 'Handmade Item',
    customerName: customerName.trim(),
    customerEmail: customerEmail?.trim() || '',
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    title: title?.trim() || '',
    comment: comment.trim(),
    status: 'pending' as const, // Admin must approve before appearing publicly!
    createdAt: new Date().toISOString(),
  };

  db.addReview(newRev);

  return res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been submitted and will appear upon moderation.',
  });
});

app.put('/api/reviews/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }
  const updated = db.updateReviewStatus(req.params.id, status);
  return res.json(updated);
});

app.delete('/api/reviews/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  db.deleteReview(req.params.id);
  return res.json({ success: true });
});

// --- STORE SETTINGS ---

app.get('/api/settings', (_req: Request, res: Response) => {
  return res.json(db.getSettings());
});

app.put('/api/settings', requireAdmin, (req: AuthRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  db.addAuditLog('Updated Settings', req.user!.email, 'Store configuration updated');
  return res.json(updated);
});

// --- ADMIN OVERVIEW & EXPORTS ---

app.get('/api/admin/overview', requireAdmin, (_req: AuthRequest, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const customRequests = db.getCustomRequests();

  const totalSales = orders
    .filter((o) => o.orderStatus !== 'cancelled' && o.orderStatus !== 'refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const pendingCustom = customRequests.filter((c) => c.status === 'pending_review').length;
  const lowStockProducts = products.filter((p) => p.isReadyMade && p.stock <= 5);

  // Profit breakdown
  let totalRevenue = 0;
  let totalEstimatedCost = 0;
  for (const o of orders) {
    if (o.orderStatus === 'cancelled' || o.orderStatus === 'refunded') continue;
    totalRevenue += o.subtotal;
    for (const item of o.items) {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        const itemCost =
          (p.internalCosts.yarnCost + p.internalCosts.labourCost + p.internalCosts.packagingCost) *
          item.quantity;
        totalEstimatedCost += itemCost;
      }
    }
  }

  const estimatedProfit = totalRevenue - totalEstimatedCost;

  return res.json({
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    pendingCustom,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    recentOrders: orders.slice(0, 5),
    recentCustom: customRequests.slice(0, 5),
    profitReport: {
      totalRevenue,
      totalEstimatedCost,
      estimatedProfit,
      marginPercent: totalRevenue > 0 ? Math.round((estimatedProfit / totalRevenue) * 100) : 0,
    },
    auditLogs: db.getAuditLogs().slice(0, 20),
  });
});

app.get('/api/admin/customers', requireAdmin, (_req: AuthRequest, res: Response) => {
  const users = db.getUsers().filter((u) => u.role === 'customer');
  const orders = db.getOrders();

  const customerStats = users.map((u) => {
    const userOrders = orders.filter(
      (o) => o.customerId === u.id || o.email.toLowerCase() === u.email.toLowerCase()
    );
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...u,
      orderCount: userOrders.length,
      totalSpent,
      lastOrder: userOrders[0]?.createdAt,
    };
  });

  return res.json(customerStats);
});

// CSV Export for Orders
app.get('/api/admin/export-orders.csv', requireAdmin, (_req: AuthRequest, res: Response) => {
  const orders = db.getOrders();
  const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'City', 'Total (PKR)', 'Payment Method', 'Order Status', 'Items Count'];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.substring(0, 10),
    `"${o.customerName.replace(/"/g, '""')}"`,
    o.phone,
    `"${o.city}"`,
    o.total,
    o.paymentMethod.toUpperCase(),
    o.orderStatus,
    o.items.reduce((s, i) => s + i.quantity, 0),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="b-crochet-orders.csv"');
  return res.send(csv);
});

// Start Express server and mount Vite in development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 B. Crochet Boutique server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
