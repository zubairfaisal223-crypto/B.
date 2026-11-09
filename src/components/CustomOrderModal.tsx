import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Upload,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_TYPES = [
  'Crochet Bouquets (Wedding / Graduation / Birthday)',
  'Everlasting Potted Flowers (Tulips / Daisies / Roses)',
  'Artisan Crochet Handbag / Tote Bag',
  'Amigurumi Plushie / Animal Companion',
  'Crochet Hair Accessories & Jewelry',
  'Mini Charms & Keychains',
  'Home Decor & Car Mirror Hanger',
  'Other Bespoke Creation',
];

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || 'Lahore');
  const [productType, setProductType] = useState(PRESET_TYPES[0]);
  const [preferredColours, setPreferredColours] = useState('Blush Pink, Sage Green & Cream');
  const [size, setSize] = useState('Medium Standard');
  const [quantity, setQuantity] = useState(1);
  const [budgetPKR, setBudgetPKR] = useState(4500);
  const [deadline, setDeadline] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      setSubmittedRequestNumber(data.customRequest.requestNumber);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-[2.5rem] max-w-2xl w-full my-auto shadow-2xl border border-[#E5C365]/40 overflow-hidden relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRequestNumber ? (
          /* Success Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F5DADB] flex items-center justify-center text-[#D4737B] mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="font-serif-luxury text-3xl font-semibold text-[#2D2527]">
              Custom Request Received!
            </h2>

            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5C365]/50 inline-block max-w-md mx-auto text-left">
              <p className="text-xs text-[#7D6E73]">Your Request Reference Number:</p>
              <p className="text-xl font-mono font-bold text-[#9A7B1C]">{submittedRequestNumber}</p>
              <p className="text-xs text-[#574A4E] mt-2">
                Our lead artisan will review your design requirements and send a customized quotation in PKR directly to your phone / WhatsApp / email within 12 hours.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={onClose}
                className="py-3 px-8 rounded-full bg-[#2D2527] text-[#FAF6F0] font-semibold text-sm hover:bg-[#45383B] transition-all"
              >
                Return to Boutique
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#E5C365]/50 text-[#9A7B1C] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Artisanal Atelier
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#2D2527]">
                Commission a Bespoke Crochet Piece
              </h2>
              <p className="text-xs text-[#7D6E73] mt-1 max-w-md mx-auto">
                Have a dream bouquet, specific palette, or custom amigurumi design in mind? Share your inspiration and we’ll handcraft it for you.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Product Type */}
              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">
                  Creation Type *
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs sm:text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                >
                  {PRESET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">Your Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ayesha Siddiqui"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                    />
                    <User className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">
                    Phone / WhatsApp (Pakistan) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                    />
                    <Phone className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ayesha@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                    />
                    <Mail className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">City in Pakistan</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore / Karachi"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                    />
                    <MapPin className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Design Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">
                    Preferred Yarn Colors
                  </label>
                  <input
                    type="text"
                    value={preferredColours}
                    onChange={(e) => setPreferredColours(e.target.value)}
                    placeholder="e.g. Dusty rose, Champagne, Olive leaves"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">
                    Approximate Size / Dimensions
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. 10 stems, or 30 cm tote"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">
                    Budget in PKR (Rs.)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={100}
                      value={budgetPKR}
                      onChange={(e) => setBudgetPKR(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="e.g. 4500"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                    />
                    <DollarSign className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2D2527] mb-1">
                    Event / Target Deadline Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                    />
                    <Calendar className="w-4 h-4 text-[#7D6E73] absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Reference Image Upload or URL */}
              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">
                  Reference Image / Inspiration Photo
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-[#C59B27] bg-[#FAF6F0] text-xs font-medium text-[#2D2527] hover:bg-[#F5DADB]/30 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#9A7B1C]" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-[#7D6E73]">or enter image URL:</span>
                  <input
                    type="url"
                    value={referenceImage.startsWith('data:') ? '' : referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527]"
                  />
                </div>

                {referenceImage && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-[#E5C365]">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReferenceImage('')}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#2D2527] mb-1">
                  Additional Notes & Special Requests
                </label>
                <textarea
                  rows={3}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Tell us about wrapping preferences, special greeting card message, or exact yarn textures..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-xs text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-[11px] text-[#574A4E] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#9A7B1C] flex-shrink-0 mt-0.5" />
                <span>
                  Custom requests are reviewed by our studio. You will receive a quotation first. Production only begins after your confirmation.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#E5C365] font-semibold text-sm hover:from-[#3D3336] hover:to-[#574A4E] transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Submitting to Artisan...' : 'Submit Custom Request for Review'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
