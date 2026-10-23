import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { preconnect } from "react-dom";

import { AppHeader } from "@/components/layout/app-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SiteFooter } from "@/components/layout/site-footer";

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
  // Artwork comes from TMDB's image servers; opening the connection early helps when an image is
  // requested from there directly (the optimiser fallback).
  preconnect("https://image.tmdb.org");

  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          className="fixed top-3 left-3 z-50 inline-flex min-h-11 -translate-y-20 items-center rounded-lg bg-accent px-4 text-sm font-bold text-accent-foreground transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          href="#main-content"
        >
          Skip to content
        </a>
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col" id="main-content">
          {children}
        </main>
        <SiteFooter />
        <MobileNavigation />
      </body>
    </html>
  );
}
