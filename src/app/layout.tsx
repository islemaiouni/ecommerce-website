import type { Metadata } from "next";
import { Cairo, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PixelScripts } from "@/features/analytics/components/pixel-scripts";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "SULTAN — Parfums d'exception pour hommes",
  description:
    "Découvrez une collection de parfums masculins premium. Livraison dans les 58 wilayas d'Algérie et paiement à la livraison.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "SULTAN — Parfums d'exception",
    description: "L'élégance, livrée partout en Algérie.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" dir="ltr" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} ${cairo.variable} antialiased`}>
        <PixelScripts />
        {children}
      </body>
    </html>
  );
}
