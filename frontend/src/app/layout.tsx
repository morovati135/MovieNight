import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col pb-20 md:pb-0">{children}</main>
        <MobileNavigation />
      </body>
    </html>
  );
}
