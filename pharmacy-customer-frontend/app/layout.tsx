import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Long Chau Pharmacy - Healthcare & Wellness",
  description: "Your trusted pharmacy for medicines, health supplements, medical devices, and wellness products. Quality healthcare delivered to your doorstep.",
  keywords: "pharmacy, medicine, health, wellness, prescription, supplements, medical devices",
  openGraph: {
    title: "Long Chau Pharmacy - Healthcare & Wellness",
    description: "Your trusted pharmacy for medicines, health supplements, medical devices, and wellness products.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
