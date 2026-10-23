import type { Metadata } from "next";

import { AboutExperience } from "@/components/about/about-experience";

export const metadata: Metadata = {
  description: "MovieNight is a portfolio and practice project designed and developed by Amir Mahdi Morovati.",
  title: "About",
};

export default function AboutPage() {
  return <AboutExperience />;
}
