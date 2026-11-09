import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, updateUser } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('b_crochet_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync wishlist from user profile if available
  useEffect(() => {
    if (user && Array.isArray(user.wishlist)) {
      setWishlist(user.wishlist);
    }
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    const next = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(next);
    localStorage.setItem('b_crochet_wishlist', JSON.stringify(next));

    // Save to user account if logged in
    if (user && token) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ wishlist: next }),
        });
        if (res.ok) {
          const data = await res.json();
          updateUser(data.user);
        }
      } catch (err) {
        console.error('Failed to sync wishlist to account', err);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
