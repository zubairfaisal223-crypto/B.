import React from 'react';
import { X, FileText, ShieldCheck, Heart, Truck, HelpCircle } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface PolicyModalProps {
  policyKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyKey, isOpen, onClose }) => {
  const { settings } = useStoreSettings();

  if (!isOpen || !policyKey || !settings) return null;

  const getPolicyDetails = () => {
    switch (policyKey) {
      case 'aboutUs':
        return {
          title: 'About B. Crochet Boutique',
          icon: <Heart className="w-6 h-6 text-[#D4737B]" />,
          content: settings.policies.aboutUs,
        };
      case 'shippingPolicy':
        return {
          title: 'Shipping & Delivery in Pakistan',
          icon: <Truck className="w-6 h-6 text-[#9A7B1C]" />,
          content: settings.policies.shippingPolicy,
        };
      case 'returnRefundPolicy':
        return {
          title: 'Return & Refund Policy',
          icon: <ShieldCheck className="w-6 h-6 text-[#2D2527]" />,
          content: settings.policies.returnRefundPolicy,
        };
      case 'privacyPolicy':
        return {
          title: 'Privacy Policy',
          icon: <ShieldCheck className="w-6 h-6 text-[#2D2527]" />,
          content: settings.policies.privacyPolicy,
        };
      case 'termsConditions':
        return {
          title: 'Terms & Conditions',
          icon: <FileText className="w-6 h-6 text-[#2D2527]" />,
          content: settings.policies.termsConditions,
        };
      case 'customOrderPolicy':
        return {
          title: 'Custom Order Guide & Policies',
          icon: <HelpCircle className="w-6 h-6 text-[#E5C365]" />,
          content: settings.policies.customOrderPolicy,
        };
      default:
        return {
          title: 'Store Information',
          icon: <FileText className="w-6 h-6 text-[#2D2527]" />,
          content: 'Information is being updated.',
        };
    }
  };

  const { title, icon, content } = getPolicyDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-[2.5rem] max-w-2xl w-full my-auto shadow-2xl border border-[#F5EFEB] overflow-hidden relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#EFE7DE]">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] flex items-center justify-center border border-[#EFE7DE]">
            {icon}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#9A7B1C] font-semibold">
              B. Boutique Official
            </span>
            <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2527]">{title}</h2>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 text-xs sm:text-sm text-[#574A4E] leading-relaxed whitespace-pre-line font-light">
          {content}
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFE7DE] flex justify-between items-center text-xs text-[#7D6E73]">
          <span>Handcrafted in Pakistan • Prices in PKR</span>
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-[#2D2527] text-white font-semibold text-xs hover:bg-[#45383B]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
