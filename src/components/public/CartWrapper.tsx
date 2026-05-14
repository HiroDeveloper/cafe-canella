"use client";

import { CartProvider } from "@/context/CartContext";
import CartButton from "./CartButton";
import CartModal from "./CartModal";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  whatsappNumber: string;
  cartTemplate: string;
  showCart: boolean;
}

export default function CartWrapper({ children, whatsappNumber, cartTemplate, showCart }: Props) {
  if (!showCart) return <>{children}</>;

  return (
    <CartProvider whatsappNumber={whatsappNumber} cartTemplate={cartTemplate}>
      {children}
      <CartButton />
      <CartModal />
    </CartProvider>
  );
}
