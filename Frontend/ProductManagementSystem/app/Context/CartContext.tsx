import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageURL: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* Load cart on app start */
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const stored = await AsyncStorage.getItem('cart');
    if (stored) setCartItems(JSON.parse(stored));
  };

  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    await AsyncStorage.setItem('cart', JSON.stringify(items));
  };

  /* ADD TO CART */
  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const index = prev.findIndex(p => p.productId === item.productId);
      let updated = [...prev];

      if (index >= 0) {
        updated[index].quantity += item.quantity;
      } else {
        updated.push(item);
      }

      AsyncStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  /* REMOVE ITEM */
  const removeFromCart = (productId: number) => {
    const updated = cartItems.filter(i => i.productId !== productId);
    saveCart(updated);
  };

  /* CLEAR CART */
  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem('cart');
  };

  /* UPDATE QUANTITY */
  const updateQuantity = (productId: number, qty: number) => {
    const updated = cartItems.map(i =>
      i.productId === productId ? { ...i, quantity: qty } : i
    );
    saveCart(updated);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.reduce((s, i) => s + i.quantity, 0),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* Hook */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};
