import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { Product, Review } from '../types';
import { formatPKR } from '../utils/pricing';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomOrder?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenCustomOrder,
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Submit review state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors[0] || 'Standard');
      setSelectedSize(product.sizes[0] || 'Standard');
      setQuantity(1);
      setAddedAnimation(false);
      setReviewSuccess(null);
      setReviewError(null);

      // Fetch approved reviews for this product
      setLoadingReviews(true);
      fetch(`/api/reviews?productId=${product.id}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setReviews(data))
        .catch((err) => console.error('Error loading reviews:', err))
        .finally(() => setLoadingReviews(false));
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product.id);
  const maxStock = product.isReadyMade ? product.stock : 99;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);
    setSubmittingReview(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName,
          customerEmail: reviewEmail,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      setReviewSuccess(data.message || 'Thank you! Your review has been submitted for moderation.');
      setReviewName('');
      setReviewEmail('');
      setReviewTitle('');
      setReviewComment('');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-[2.5rem] max-w-4xl w-full my-auto shadow-2xl border border-[#F5EFEB] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#2D2527] shadow-md transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Gallery Column */}
          <div className="md:col-span-6 bg-[#FAF6F0] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#F5EFEB]">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-md border border-[#F5DADB]">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Prev / Next Image arrows if multiple */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[#2D2527] shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[#2D2527] shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all ${
                  isFavorited
                    ? 'bg-[#D4737B] text-white'
                    : 'bg-white/90 text-[#3D3336] hover:text-[#D4737B]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#C59B27] scale-105 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Value guarantee highlights */}
            <div className="mt-6 pt-4 border-t border-[#EFE7DE] grid grid-cols-2 gap-3 text-xs text-[#574A4E]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C59B27]" />
                <span>Leopards / TCS Courier</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4737B]" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Ready-made vs Made-to-order Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7D6E73]">
                  SKU: {product.sku}
                </span>
                {product.isReadyMade ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6F0] text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Ready-Made ({product.stock} in stock)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F9EEF0] text-[#D4737B] border border-[#F5DADB]">
                    <Clock className="w-3.5 h-3.5" />
                    Made to Order (~{product.estimatedProductionDays} days)
                  </span>
                )}
              </div>

              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#2D2527] leading-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 my-3">
                <span className="font-serif-luxury text-3xl font-bold text-[#2D2527]">
                  {formatPKR(product.price)}
                </span>
                <span className="text-xs text-[#7D6E73]">Includes luxury packaging</span>
              </div>

              {/* Tabs: Details vs Reviews */}
              <div className="flex border-b border-[#EFE7DE] mb-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-3 border-b-2 transition-all ${
                    activeTab === 'details'
                      ? 'border-[#2D2527] text-[#2D2527]'
                      : 'border-transparent text-[#7D6E73] hover:text-[#2D2527]'
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1 ${
                    activeTab === 'reviews'
                      ? 'border-[#2D2527] text-[#2D2527]'
                      : 'border-transparent text-[#7D6E73] hover:text-[#2D2527]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Reviews ({reviews.length})
                </button>
              </div>

              {activeTab === 'details' ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#574A4E] leading-relaxed">
                    {product.description}
                  </p>

                  {/* Materials & Yarn details */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2D2527]">Yarn & Fiber: </span>
                        <span className="text-[#574A4E]">{product.yarnType}</span>
                      </div>
                    </div>
                    {product.dimensions && (
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-[#7D6E73] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#2D2527]">Dimensions: </span>
                          <span className="text-[#574A4E]">{product.dimensions}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-[#2D2527] mb-1.5">
                        Color / Palette: <span className="font-normal text-[#7D6E73]">{selectedColor}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              selectedColor === color
                                ? 'bg-[#2D2527] text-[#FAF6F0] border-[#2D2527] shadow-xs'
                                : 'bg-[#FAF6F0] text-[#3D3336] border-[#EFE7DE] hover:border-[#C59B27]'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-[#2D2527] mb-1.5">
                        Size / Style: <span className="font-normal text-[#7D6E73]">{selectedSize}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              selectedSize === size
                                ? 'bg-[#2D2527] text-[#FAF6F0] border-[#2D2527] shadow-xs'
                                : 'bg-[#FAF6F0] text-[#3D3336] border-[#EFE7DE] hover:border-[#C59B27]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D2527] mb-1.5">
                      Quantity
                    </label>
                    <div className="inline-flex items-center rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#2D2527] hover:bg-white disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-[#2D2527]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                        disabled={quantity >= maxStock}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#2D2527] hover:bg-white disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Reviews Tab */
                <div className="space-y-4">
                  {loadingReviews ? (
                    <p className="text-xs text-[#7D6E73]">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-xs text-[#7D6E73] italic">
                      No reviews yet for this product. Be the first to share your experience!
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {reviews.map((r) => (
                        <div key={r.id} className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#2D2527]">{r.customerName}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < r.rating ? 'fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {r.title && <p className="font-medium text-[#2D2527] mt-1">{r.title}</p>}
                          <p className="text-[#574A4E] mt-0.5">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Write a review form */}
                  <form onSubmit={handleSubmitReview} className="pt-3 border-t border-[#EFE7DE] space-y-2">
                    <p className="text-xs font-bold text-[#2D2527]">Write a Review</p>
                    {reviewSuccess && (
                      <p className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                        {reviewSuccess}
                      </p>
                    )}
                    {reviewError && (
                      <p className="p-2 rounded-lg bg-red-50 text-red-800 text-xs">
                        {reviewError}
                      </p>
                    )}

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#7D6E73] mr-2">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-400 p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= reviewRating ? 'fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Your Name *"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Review Title"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                    />

                    <textarea
                      required
                      rows={2}
                      placeholder="Share your thoughts about this handmade item... *"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="py-1.5 px-4 rounded-lg bg-[#2D2527] text-white text-xs font-semibold hover:bg-[#45383B] disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-[#EFE7DE] space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.isReadyMade && product.stock <= 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#FAF6F0] font-semibold text-sm hover:from-[#3D3336] hover:to-[#574A4E] transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                    <span>Added to Cart!</span>
                  </>
                ) : product.isReadyMade && product.stock <= 0 ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-[#E5C365]" />
                    <span>Add to Cart • {formatPKR(product.price * quantity)}</span>
                  </>
                )}
              </button>

              {onOpenCustomOrder && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCustomOrder();
                  }}
                  className="w-full text-center text-xs text-[#9A7B1C] hover:underline"
                >
                  Need a different flower, color, or personalized card? Request a custom order &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
