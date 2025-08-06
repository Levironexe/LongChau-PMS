"use client"

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import { PrescriptionProvider } from "../contexts/PrescriptionContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrescriptionProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </PrescriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}