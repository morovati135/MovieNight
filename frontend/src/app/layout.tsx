import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { AppHeader } from "@/components/layout/app-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

import "./globals.css";

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "MovieNight",
  description: "Discover your next movie night favorite.",
};

export const viewport: Viewport = {
  themeColor: "#030a1b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          href="#main-content"
        >
          Skip to content
        </a>
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col pb-20 md:pb-0" id="main-content">
          {children}
        </main>
        <MobileNavigation />
      </body>
    </html>
  );
}
