import React from 'react';
import { Category } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-16 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#9A7B1C] font-semibold">
            Bespoke Collections
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2D2527] font-normal mt-1">
            Shop by Category
          </h2>
          <p className="text-sm text-[#7D6E73] mt-2">
            Each collection is thoughtfully designed with premium milk cotton yarn, tailored for lasting joy and aesthetic elegance.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative rounded-3xl overflow-hidden bg-[#FAF6F0] border border-[#F5EFEB] aspect-[3/4] text-left focus:outline-none hover:shadow-xl hover:border-[#E5C365]/60 transition-all duration-300 cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D2527]/90 via-[#2D2527]/30 to-transparent group-hover:from-[#2D2527]/95 transition-all" />

              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury text-lg sm:text-xl font-medium text-[#FAF6F0] group-hover:text-[#E5C365] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                    <ArrowUpRight className="w-4 h-4 text-[#E5C365]" />
                  </div>
                </div>

                <p className="text-[11px] text-[#FAF6F0]/80 line-clamp-2 mt-1">
                  {cat.description}
                </p>

                {cat.itemCount !== undefined && (
                  <span className="text-[10px] tracking-wider uppercase text-[#E5C365] font-semibold mt-2">
                    {cat.itemCount} {cat.itemCount === 1 ? 'Design' : 'Designs'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
