import React from 'react';
import { Sparkles, ArrowRight, Flower2, Heart, ShieldCheck, Truck } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface HeroProps {
  onShopNow: () => void;
  onCustomOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onCustomOrder }) => {
  const { settings } = useStoreSettings();

  const hero = settings?.heroBanner || {
    headline: 'Where Every Stitch Tells an Heirloom Story',
    subheadline: 'Bespoke handcrafted crochet bouquets, heirloom bags, and whimsical custom pieces created in Pakistan with premium milk cotton yarn.',
    ctaText: 'Explore Collection',
    customCtaText: 'Request Custom Order',
    bannerImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=85',
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#FDFBF7] to-[#F5EFEB] py-12 md:py-20 lg:py-24">
      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#F5DADB]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#E5C365]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] border border-[#E5C365]/40 text-[#9A7B1C] text-xs font-semibold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Artisanal Luxury • Made in Pakistan</span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#2D2527] leading-[1.12]">
              {hero.headline}
            </h1>

            <p className="text-base sm:text-lg text-[#574A4E] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              {hero.subheadline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#2D2527] text-[#FAF6F0] font-semibold text-sm hover:bg-[#45383B] transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group"
              >
                <span>{hero.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-[#E5C365] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onCustomOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#FAF6F0] text-[#2D2527] border border-[#E5C365] font-semibold text-sm hover:bg-[#F5DADB]/40 transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{hero.customCtaText}</span>
              </button>
            </div>

            {/* Value Props Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#EFE7DE]/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <Flower2 className="w-5 h-5 text-[#D4737B] mb-1" />
                <span className="text-xs font-semibold text-[#2D2527]">Everlasting Blooms</span>
                <span className="text-[11px] text-[#7D6E73]">Never wilts or fades</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <Truck className="w-5 h-5 text-[#9A7B1C] mb-1" />
                <span className="text-xs font-semibold text-[#2D2527]">Nationwide Delivery</span>
                <span className="text-[11px] text-[#7D6E73]">Across all Pakistan</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <ShieldCheck className="w-5 h-5 text-[#2D2527] mb-1" />
                <span className="text-xs font-semibold text-[#2D2527]">Cash on Delivery</span>
                <span className="text-[11px] text-[#7D6E73]">Secure & verified</span>
              </div>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-[#FAF6F0] relative group">
                <img
                  src={hero.bannerImage}
                  alt="Handmade Crochet Bouquet"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#F5DADB] shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5DADB] flex items-center justify-center text-[#D4737B]">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2D2527]">100% Hand-Crocheted</p>
                      <p className="text-[11px] text-[#7D6E73]">Crafted with Milk Cotton</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#9A7B1C] font-semibold block">Prices in</span>
                    <span className="text-xs font-bold text-[#2D2527]">PKR (Rs.)</span>
                  </div>
                </div>
              </div>

              {/* Little floating accent card */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-[#2D2527] text-[#FAF6F0] py-2 px-4 rounded-full shadow-lg border border-[#E5C365] text-xs font-medium flex items-center gap-1.5 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
                <span>Ready-Made Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
