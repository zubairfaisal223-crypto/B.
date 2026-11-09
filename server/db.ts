import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Category,
  Order,
  CustomRequest,
  User,
  Coupon,
  Review,
  StoreSettings
} from '../src/types';
import { DEFAULT_DELIVERY_RULES } from '../src/utils/pricing';

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customRequests: CustomRequest[];
  users: Array<User & { passwordHash: string; salt: string }>;
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
  auditLogs: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details?: string;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

// Initial Admin Credentials
const defaultAdminPassword = hashPassword('Admin@BCrochet2026!');

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-flowers',
    name: 'Crochet Flowers',
    slug: 'crochet-flowers',
    description: 'Everlasting handcrafted single stems, potted plants, and botanical arrangements.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
  },
  {
    id: 'cat-bouquets',
    name: 'Crochet Bouquets',
    slug: 'crochet-bouquets',
    description: 'Lavish handcrafted bouquets for birthdays, anniversaries, graduations, and weddings.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
  },
  {
    id: 'cat-bags',
    name: 'Crochet Bags',
    slug: 'crochet-bags',
    description: 'Chic Parisian tote bags, granny square shoulder bags, and bohemian clutches.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    displayOrder: 3,
  },
  {
    id: 'cat-keychains',
    name: 'Crochet Keychains',
    slug: 'crochet-keychains',
    description: 'Delicate mini crochet charms, strawberries, daisies, and lucky trinkets.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    displayOrder: 4,
  },
  {
    id: 'cat-plushies',
    name: 'Crochet Plushies',
    slug: 'crochet-plushies',
    description: 'Ultra-soft amigurumi bunnies, bears, and whimsical crochet companions.',
    image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&w=600&q=80',
    displayOrder: 5,
  },
  {
    id: 'cat-accessories',
    name: 'Crochet Accessories',
    slug: 'crochet-accessories',
    description: 'Artisan floral hair clips, bucket hats, collars, and scrunchies.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    displayOrder: 6,
  },
  {
    id: 'cat-gifts',
    name: 'Crochet Gifts',
    slug: 'crochet-gifts',
    description: 'Curated gift boxes with handmade cards, fairy lights, and scented sachets.',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
    displayOrder: 7,
  },
  {
    id: 'cat-custom',
    name: 'Custom Creations',
    slug: 'custom-creations',
    description: 'Bespoke crochet pieces customized to your exact colors, dimensions, and inspiration.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    displayOrder: 8,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Pastel Garden Grand Crochet Bouquet',
    slug: 'pastel-garden-grand-crochet-bouquet',
    description: 'Our signature luxury bouquet featuring 9 handcrafted stems including English roses, French lavender, forget-me-nots, and delicate eucalyptus leaves. Wrapped in imported Korean blush wrapping paper with champagne satin ribbon.',
    price: 4800,
    category: 'cat-bouquets',
    sku: 'BC-BQ-001',
    colors: ['Blush Pink & Cream', 'Lilac & Lavender', 'Champagne Sunset'],
    sizes: ['Grand (9 Stems)', 'Classic (6 Stems)'],
    stock: 8,
    status: 'active',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isReadyMade: true,
    estimatedProductionDays: 1,
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: '100% Premium Milk Cotton Yarn (Non-pilling)',
    dimensions: 'Height: 38cm, Width: 28cm',
    careInstructions: 'Keep away from direct moisture. Dust lightly with a soft brush.',
    internalCosts: {
      yarnCost: 750,
      labourCost: 1400,
      packagingCost: 450,
      deliveryEstimateCost: 220,
    },
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Perpetual Blooming Potted Tulip',
    slug: 'perpetual-blooming-potted-tulip',
    description: 'An enchanting standalone potted tulip with crochet terracotta style base and wire-reinforced bendable stem. A forever bloom for study desks, side tables, or gifting.',
    price: 1350,
    category: 'cat-flowers',
    sku: 'BC-FL-002',
    colors: ['Dutch Peach', 'Cream White', 'Soft Lavender', 'Vintage Rose'],
    sizes: ['Single Stem Pot'],
    stock: 14,
    status: 'active',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isReadyMade: true,
    estimatedProductionDays: 1,
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: '4-Ply Milk Cotton with Brass Wire Core',
    dimensions: 'Height: 18cm, Base Diameter: 7cm',
    careInstructions: 'Spot clean only. Stems can be gently repositioned.',
    internalCosts: {
      yarnCost: 220,
      labourCost: 400,
      packagingCost: 150,
      deliveryEstimateCost: 200,
    },
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Artisan Daisy Granny Square Tote Bag',
    slug: 'artisan-daisy-granny-square-tote-bag',
    description: 'Heirloom quality handcrafted tote bag composed of 18 individual floral granny squares. Sturdy double-crochet handles, reinforced canvas lining, and magnetic interior snap clasp.',
    price: 3600,
    category: 'cat-bags',
    sku: 'BC-BG-003',
    colors: ['Oatmeal Cream & Daisies', 'Sage Green Floral', 'Blush Bloom'],
    sizes: ['Standard (36x32 cm)'],
    stock: 5,
    status: 'active',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isReadyMade: false,
    estimatedProductionDays: 5,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: 'Mercerized Heavyweight Cotton Yarn with Cotton Canvas Lining',
    dimensions: 'Width: 36cm, Height: 32cm, Strap Drop: 28cm',
    careInstructions: 'Gentle hand wash in cold water with mild detergent. Lay flat to dry.',
    internalCosts: {
      yarnCost: 850,
      labourCost: 1200,
      packagingCost: 250,
      deliveryEstimateCost: 220,
    },
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Buttercup Bunny Heirloom Amigurumi Plushie',
    slug: 'buttercup-bunny-heirloom-amigurumi-plushie',
    description: 'Charming crochet bunny with long floppy ears, hand-embroidered facial features, and a removable crochet ruffled pinafore dress. Stuffed with hypoallergenic polyester fiberfill.',
    price: 2450,
    category: 'cat-plushies',
    sku: 'BC-PL-004',
    colors: ['Champagne Beige', 'Powder Rose', 'Milk Cream'],
    sizes: ['24 cm Standing'],
    stock: 7,
    status: 'active',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isReadyMade: true,
    estimatedProductionDays: 2,
    images: [
      'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: 'Ultra-Soft Baby Acrylic & Milk Cotton Blend',
    dimensions: 'Height: 24cm',
    careInstructions: 'Safe for children. Hand sponge clean only.',
    internalCosts: {
      yarnCost: 350,
      labourCost: 750,
      packagingCost: 200,
      deliveryEstimateCost: 200,
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Strawberry Blossom Charm Keychain',
    slug: 'strawberry-blossom-charm-keychain',
    description: 'Sweet handmade crochet strawberry charm with tiny white blossom and golden lobster clasp ring. Perfect as a bag charm, car mirror accessory, or thoughtful gift.',
    price: 650,
    category: 'cat-keychains',
    sku: 'BC-KC-005',
    colors: ['Ripe Crimson Red', 'Blush Coral Pink'],
    sizes: ['Mini (5.5 cm)'],
    stock: 22,
    status: 'active',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isReadyMade: true,
    estimatedProductionDays: 1,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: 'Fine 100% Combed Cotton with 14k Gold Tone Hardware',
    dimensions: 'Strawberry: 4.5cm, Total length: 9cm',
    internalCosts: {
      yarnCost: 90,
      labourCost: 180,
      packagingCost: 80,
      deliveryEstimateCost: 200,
    },
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Cherry Blossom French Hair Clip Set (Pair)',
    slug: 'cherry-blossom-french-hair-clip-set',
    description: 'Set of two handmade crochet sakura cherry blossom alligator clips. Adorned with faux pearl center beads. Adds an elegant whimsical touch to everyday hairstyles.',
    price: 850,
    category: 'cat-accessories',
    sku: 'BC-AC-006',
    colors: ['Soft Sakura Pink', 'Vintage Pearl White'],
    sizes: ['Pair (2 Clips)'],
    stock: 12,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isReadyMade: true,
    estimatedProductionDays: 1,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: 'Fine Mercerized Lace Cotton with Gold-plated Alligator Clip',
    dimensions: 'Flower: 4cm diameter, Clip: 5cm',
    internalCosts: {
      yarnCost: 110,
      labourCost: 250,
      packagingCost: 90,
      deliveryEstimateCost: 200,
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Bespoke Graduation Keepsake Crochet Sunflower',
    slug: 'bespoke-graduation-keepsake-crochet-sunflower',
    description: 'Radiant handcrafted sunflower with a miniature crochet graduation cap and personalized ribbon banner. Symbolizing warmth, brightness, and milestone celebrations.',
    price: 1650,
    category: 'cat-gifts',
    sku: 'BC-GF-007',
    colors: ['Golden Yellow & Black Cap', 'Champagne Sun & Maroon Cap'],
    sizes: ['Single Stem with Cap & Wrap'],
    stock: 10,
    status: 'active',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isReadyMade: false,
    estimatedProductionDays: 3,
    images: [
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    ],
    yarnType: 'Premium Milk Cotton with Stiffened Petal Crafting',
    dimensions: 'Sunflower Head: 12cm, Stem: 32cm',
    internalCosts: {
      yarnCost: 260,
      labourCost: 550,
      packagingCost: 180,
      deliveryEstimateCost: 200,
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    minOrderAmount: 2000,
    maxDiscountAmount: 600,
    isActive: true,
    timesUsed: 14,
  },
  {
    id: 'cpn-2',
    code: 'BHANDMADE',
    discountType: 'fixed',
    value: 300,
    minOrderAmount: 2500,
    isActive: true,
    timesUsed: 8,
  },
  {
    id: 'cpn-3',
    code: 'FREESHIP',
    discountType: 'fixed',
    value: 250,
    minOrderAmount: 3500,
    isActive: true,
    timesUsed: 5,
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Pastel Garden Grand Crochet Bouquet',
    customerName: 'Ayesha Khan',
    customerEmail: 'ayesha.k@example.com',
    rating: 5,
    title: 'Breathtaking quality! Forever keepsake',
    comment: 'Ordered this bouquet for my sister’s graduation in Lahore. The craftsmanship is out of this world! Every single petal is so neat and it came in luxury packaging with a handwritten note. Highly recommended!',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productName: 'Perpetual Blooming Potted Tulip',
    customerName: 'Fatima Zahra',
    customerEmail: 'fatima.z@example.com',
    rating: 5,
    title: 'Perfect work desk companion',
    comment: 'The peach tulip is so aesthetic. Loved the little terracotta style crochet pot. Arrived in Karachi within 3 days safely packaged.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'prod-4',
    productName: 'Buttercup Bunny Heirloom Amigurumi Plushie',
    customerName: 'Maham Tariq',
    customerEmail: 'maham.t@example.com',
    rating: 5,
    title: 'Incredible softness and attention to detail',
    comment: 'My daughter will not sleep without her bunny! The stitches are tight and super soft yarn. Worth every rupee.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'B.',
  tagline: 'Luxury Handmade Crochet Boutique',
  contactPhone: '+92 300 8765432',
  whatsappNumber: '+92 300 8765432',
  contactEmail: 'contact@bcrochet.pk',
  currencySymbol: 'PKR',
  announcementBar: {
    enabled: true,
    text: '✨ Free Delivery across Pakistan on orders over Rs. 4,500 | Crafted with pure luxury yarn 🌸',
    linkText: 'Shop Bouquets',
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
    jazzcashInstructions: 'Please transfer the exact order amount to our official JazzCash account: 0300-8765432 (Title: B. Crochet Boutique). Send transaction screenshot along with your Order Number via WhatsApp at +92 300 8765432 for instant verification.',
    easypaisaEnabled: true,
    easypaisaStatus: 'manual',
    easypaisaAccountTitle: 'B. Crochet Boutique (Official)',
    easypaisaAccountNumber: '0345-1234567',
    easypaisaInstructions: 'Please transfer the order total to Easypaisa account: 0345-1234567 (Title: B. Crochet Boutique). Share screenshot with Order Number on WhatsApp +92 300 8765432.',
  },
  policies: {
    aboutUs: `Welcome to B. Crochet Boutique. Founded in Pakistan with a passionate love for fiber arts and mindful craftsmanship, B. transforms delicate strands of milk cotton into timeless blooms, luxury accessories, and custom heirlooms. Unlike mass-produced goods, each piece is individually hand-crocheted stitch-by-stitch, ensuring superior longevity, zero wilt, and distinct personality. We take immense pride in supporting local artisan hands while bringing contemporary Pakistani aesthetics to the timeless tradition of crochet.`,
    shippingPolicy: `We offer reliable courier delivery across all cities and towns of Pakistan via Leopards Courier, Trax, and TCS. 

• Ready-Made Products: Dispatched within 24 to 48 hours. Typical courier transit time is 2-4 working days.
• Made-to-Order & Custom Products: Production requires 3-7 business days depending on complexity, followed by standard courier dispatch.
• Standard Delivery Fee: Rs. 250 across Pakistan (Karachi: Rs. 200, Lahore/Islamabad/Rawalpindi: Rs. 220).
• Free Delivery: Automatically applied on cart orders exceeding Rs. 4,500.
• Tracking: You will receive an SMS and WhatsApp tracking update as soon as your parcel is handed to the courier.`,
    returnRefundPolicy: `At B. Crochet Boutique, each item is meticulously inspected prior to packaging in our signature gift boxes.

• Damaged in Transit: In the unlikely event that your parcel arrives visibly damaged, please photograph the unopened parcel and contact our WhatsApp (+92 300 8765432) within 24 hours of delivery. We will issue an immediate replacement or full refund.
• Custom and Made-to-Order Items: Because custom pieces are crafted to your specific dimensions, colors, and design approval, custom orders cannot be returned for change of mind once production has commenced.
• Ready-Made Returns: Unused ready-made items in original condition may be exchanged within 5 days of receipt. The customer is responsible for return courier charges.`,
    privacyPolicy: `We respect your privacy. B. Crochet Boutique collects only the necessary details required to fulfill and deliver your orders (name, contact number, shipping address, and email). 
We never sell, trade, or share your personal data with third parties. Payment information submitted via mobile wallets is processed through your own secure banking/wallet applications; we never request or store your wallet PINs, OTPs, or CVVs.`,
    termsConditions: `By ordering from B. Crochet Boutique, you acknowledge and agree to our craftsmanship terms:
1. All items are handmade; subtle natural variations in tension and stitch nuance are hallmarks of authentic artisanal crochet.
2. Prices are quoted in Pakistani Rupees (PKR) and are inclusive of packaging.
3. Cash on Delivery (COD) orders require telephone or WhatsApp confirmation before dispatch.
4. We reserve the right to cancel unconfirmed or fraudulent orders.`,
    customOrderPolicy: `How Custom Orders Work:
1. Submit your custom request using our bespoke online form with reference photos, preferred yarn colors, dimensions, and target date.
2. Our artisan reviews the design and sends a tailored quotation in PKR within 12 hours.
3. Once you accept the quotation, we begin handcrafting your bespoke piece.
4. Production photos are shared on WhatsApp before dispatch to ensure 100% satisfaction!`,
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading db.json, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: [
        {
          id: 'ord-sample-1',
          orderNumber: 'B-2026-1042',
          customerId: 'user-sample',
          customerName: 'Amina Sheikh',
          phone: '0301-2345678',
          email: 'amina@example.com',
          city: 'Lahore',
          deliveryAddress: 'House 42, Block D, Model Town',
          postalCode: '54700',
          orderNotes: 'Please wrap with extra pink ribbon for a birthday!',
          items: [
            {
              productId: 'prod-1',
              productName: 'Pastel Garden Grand Crochet Bouquet',
              productImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
              price: 4800,
              quantity: 1,
              selectedColor: 'Blush Pink & Cream',
              selectedSize: 'Grand (9 Stems)',
              isReadyMade: true,
            },
          ],
          subtotal: 4800,
          deliveryFee: 0,
          discount: 0,
          total: 4800,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'delivered',
          courierTrackingNumber: 'LEO-982140',
          courierName: 'Leopards Courier',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ],
      customRequests: [
        {
          id: 'cr-sample-1',
          requestNumber: 'CR-2026-801',
          customerName: 'Sana Malik',
          phone: '0321-7654321',
          email: 'sana.malik@example.com',
          city: 'Islamabad',
          productType: 'Crochet Bouquets',
          preferredColours: 'Earthy Sage Green, Terracotta & White Daisies',
          size: '12 stems with mini eucalyptus',
          quantity: 1,
          budgetPKR: 6000,
          deadline: '2026-12-05',
          referenceImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
          additionalInstructions: 'For a wedding nikah table centerpiece. Need sturdy stems.',
          status: 'quotation_sent',
          quotationPricePKR: 5800,
          adminNotes: 'Confirmed yarn stock available. Quoted 5800 PKR including gift box.',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],
      users: [
        {
          id: 'user-admin',
          email: 'admin@bcrochet.pk',
          name: 'B. Boutique Owner',
          phone: '+92 300 8765432',
          city: 'Lahore',
          address: 'B. Crochet Studio, Gulberg III',
          role: 'admin',
          wishlist: ['prod-1', 'prod-3'],
          passwordHash: defaultAdminPassword.hash,
          salt: defaultAdminPassword.salt,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
      ],
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      settings: INITIAL_SETTINGS,
      auditLogs: [
        {
          id: 'log-1',
          action: 'System Initialized',
          performedBy: 'System',
          timestamp: new Date().toISOString(),
          details: 'Initial catalog and store configuration loaded.',
        },
      ],
    };

    this.save(initialData);
    return initialData;
  }

  private save(dataToSave?: DatabaseSchema) {
    const payload = dataToSave || this.data;
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save db.json:', err);
    }
  }

  // Getters
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id || p.slug === id);
  }

  public saveProduct(product: Product): Product {
    const index = this.data.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      this.data.products[index] = { ...this.data.products[index], ...product };
    } else {
      this.data.products.unshift(product);
    }
    this.save();
    return product;
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public saveCategory(category: Category): Category {
    const index = this.data.categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      this.data.categories[index] = { ...this.data.categories[index], ...category };
    } else {
      this.data.categories.push(category);
    }
    this.save();
    return category;
  }

  public deleteCategory(id: string): boolean {
    const prevLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Orders
  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrdersByCustomer(customerIdOrEmail: string): Order[] {
    return this.data.orders.filter(
      (o) => o.customerId === customerIdOrEmail || o.email.toLowerCase() === customerIdOrEmail.toLowerCase()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);

    // Automatically update stock for ready-made products
    for (const item of order.items) {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod && prod.isReadyMade) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    this.save();
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    updates: Partial<Pick<Order, 'orderStatus' | 'paymentStatus' | 'courierTrackingNumber' | 'courierName' | 'refundAmount' | 'adminNotes'>>
  ): Order | undefined {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    Object.assign(order, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return order;
  }

  // Custom Requests
  public getCustomRequests(): CustomRequest[] {
    return this.data.customRequests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCustomRequestsByCustomer(email: string): CustomRequest[] {
    return this.data.customRequests.filter((r) => r.email.toLowerCase() === email.toLowerCase());
  }

  public getCustomRequestById(id: string): CustomRequest | undefined {
    return this.data.customRequests.find((r) => r.id === id || r.requestNumber === id);
  }

  public createCustomRequest(request: CustomRequest): CustomRequest {
    this.data.customRequests.unshift(request);
    this.save();
    return request;
  }

  public updateCustomRequest(id: string, updates: Partial<CustomRequest>): CustomRequest | undefined {
    const req = this.data.customRequests.find((r) => r.id === id);
    if (!req) return undefined;

    Object.assign(req, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return req;
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash, salt, ...user }) => user);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: string): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  public createUser(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    city?: string;
    address?: string;
    role?: 'admin' | 'customer';
  }): User {
    const { hash, salt } = hashPassword(userData.password);
    const newUser = {
      id: `usr-${crypto.randomBytes(6).toString('hex')}`,
      email: userData.email.toLowerCase().trim(),
      name: userData.name.trim(),
      phone: userData.phone || '',
      city: userData.city || '',
      address: userData.address || '',
      role: userData.role || 'customer',
      wishlist: [],
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();

    const { passwordHash, salt: _, ...safe } = newUser;
    return safe;
  }

  public updateUserProfile(id: string, updates: Partial<Pick<User, 'name' | 'phone' | 'city' | 'address' | 'wishlist'>>): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;

    Object.assign(user, updates);
    this.save();

    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  public hasAnyAdmin(): boolean {
    return this.data.users.some((u) => u.role === 'admin');
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  }

  public saveCoupon(coupon: Coupon): Coupon {
    const index = this.data.coupons.findIndex((c) => c.id === coupon.id);
    if (index >= 0) {
      this.data.coupons[index] = { ...this.data.coupons[index], ...coupon };
    } else {
      this.data.coupons.unshift(coupon);
    }
    this.save();
    return coupon;
  }

  public deleteCoupon(id: string): boolean {
    const prev = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((c) => c.id !== id);
    if (this.data.coupons.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // Reviews
  public getReviews(status?: 'approved' | 'pending' | 'rejected'): Review[] {
    if (status) {
      return this.data.reviews.filter((r) => r.status === status);
    }
    return this.data.reviews;
  }

  public getApprovedReviewsForProduct(productId: string): Review[] {
    return this.data.reviews.filter((r) => r.productId === productId && r.status === 'approved');
  }

  public addReview(review: Review): Review {
    this.data.reviews.unshift(review);
    this.save();
    return review;
  }

  public updateReviewStatus(id: string, status: 'approved' | 'rejected'): Review | undefined {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (!rev) return undefined;
    rev.status = status;
    this.save();
    return rev;
  }

  public deleteReview(id: string): boolean {
    const prev = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    if (this.data.reviews.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // Settings
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  // Audit Logs
  public addAuditLog(action: string, performedBy: string, details?: string) {
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
    });
    // keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }
}

export const db = new Database();
