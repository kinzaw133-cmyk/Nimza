import type { Metadata, Viewport } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { CartProvider } from "@/components/Cart";
import { WishlistProvider } from "@/components/Wishlist";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Lazy-load VoiceAssistant on client to eliminate ~50KB from critical first-load bundle
const VoiceAssistant = dynamic(() => import("@/components/VoiceAssistant"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Nimza Restaurant & Lounge — Fine Dining & Gastronomy",
  description:
    "An unhurried dining ritual celebrating wood-fire craft, black winter truffles, prime dry-aged cuts, and living cellar vintages. Heritage of Budapest, Lyon and Milan.",
  keywords: [
    "Nimza Restaurant",
    "Fine Dining",
    "Michelin Standard",
    "Truffle Tagliatelle",
    "Wood Fire Grill",
    "Wine Cellar",
    "Luxury Restaurant",
  ],
  authors: [{ name: "Chef Elias Varga" }],
  openGraph: {
    title: "Nimza Restaurant & Lounge",
    description: "Fine dining, patience, and unhurried hospitality.",
    url: "https://nimza.example",
    siteName: "Nimza",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Nimza Restaurant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo-circle.png" />
        <link rel="apple-touch-icon" href="/logo-circle.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAFAF8] text-[#1F241F] antialiased selection:bg-gold selection:text-[#1F241F]">
        <QueryProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              {children}
              <Footer />
              <VoiceAssistant />
            </WishlistProvider>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
