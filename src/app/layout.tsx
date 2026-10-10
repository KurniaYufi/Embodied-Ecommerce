import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ToastProvider } from "@/contexts/ToastContext";
import CartDrawer from "@/components/CartDrawer";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Embodied";

export const metadata: Metadata = {
  title: { default: `${appName} — Wear What You Are`, template: `%s · ${appName}` },
  description: "Embodied — Wear What You Are. Clothing in natural fibres, made in small batches in Indonesia.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#131211" },
  ],
};

// Applies the saved Appearance preference (and a dismissed announcement bar) before first paint to avoid a flash.
const appearanceScript = `(function(){try{var m=localStorage.getItem("embodied-appearance")||"system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);if(sessionStorage.getItem("embodied-announcement-dismissed")==="1")document.documentElement.classList.add("announcement-dismissed");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
        <style>{`.announcement-dismissed [data-announcement]{display:none}`}</style>
      </head>
      <body className="min-h-full bg-paper font-sans text-ink antialiased">
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
