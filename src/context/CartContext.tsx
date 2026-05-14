"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { MenuItem, ItemPrice } from "@/lib/types";

export interface CartItem {
  menuItem: MenuItem;
  selectedPrice: ItemPrice;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (menuItem: MenuItem, selectedPrice: ItemPrice) => void;
  removeItem: (itemId: string, priceId: string) => void;
  updateQty: (itemId: string, priceId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  whatsappNumber: string;
  cartTemplate: string;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  whatsappNumber,
  cartTemplate,
}: {
  children: ReactNode;
  whatsappNumber: string;
  cartTemplate: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((menuItem: MenuItem, selectedPrice: ItemPrice) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.menuItem.id === menuItem.id && i.selectedPrice.id === selectedPrice.id
      );
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id && i.selectedPrice.id === selectedPrice.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem, selectedPrice, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string, priceId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.menuItem.id === itemId && i.selectedPrice.id === priceId))
    );
  }, []);

  const updateQty = useCallback((itemId: string, priceId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.menuItem.id === itemId && i.selectedPrice.id === priceId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * i.selectedPrice.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
        whatsappNumber,
        cartTemplate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
