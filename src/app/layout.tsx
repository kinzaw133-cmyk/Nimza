import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { CartProvider } from "@/components/Cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pf = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-pf",
  display: "swap",
});

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
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
        url: "/logo-header.jpg",
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
  themeColor: "#27301B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pf.variable} ${dm.variable}`}>
      <head>
        <link rel="icon" href="/logo-circle.jpg" />
      </head>
      <body className="bg-ivory text-charcoal antialiased selection:bg-gold selection:text-olive">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
