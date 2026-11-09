import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { calculateSubtotal } from '../utils/pricing';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeItem: (productId: string, selectedColor: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedColor: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('b_crochet_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('b_crochet_cart', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [items]);

  const addItem = (
    product: Product,
    quantity = 1,
    selectedColor = product.colors[0] || 'Standard',
    selectedSize = product.sizes[0] || 'Standard'
  ) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedColor === selectedColor &&
          i.selectedSize === selectedSize
      );

      if (index >= 0) {
        const next = [...prev];
        const newQty = next[index].quantity + quantity;
        // Check max stock if ready-made
        if (product.isReadyMade && newQty > product.stock) {
          next[index].quantity = product.stock;
        } else {
          next[index].quantity = newQty;
        }
        return next;
      }

      const initialQty = product.isReadyMade ? Math.min(quantity, Math.max(1, product.stock)) : quantity;
      return [...prev, { product, quantity: initialQty, selectedColor, selectedSize }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, selectedColor: string, selectedSize: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.product.id === productId &&
            i.selectedColor === selectedColor &&
            i.selectedSize === selectedSize
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    selectedColor: string,
    selectedSize: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, selectedColor, selectedSize);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (
          i.product.id === productId &&
          i.selectedColor === selectedColor &&
          i.selectedSize === selectedSize
        ) {
          const max = i.product.isReadyMade ? i.product.stock : 99;
          return { ...i, quantity: Math.min(quantity, max) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = calculateSubtotal(
    items.map((i) => ({ id: i.product.id, price: i.product.price, quantity: i.quantity }))
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
