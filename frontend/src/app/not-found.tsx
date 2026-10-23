import type { Metadata } from "next";
import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { PageNotice } from "@/components/home/home-states";
import { buttonVariants } from "@/components/ui/button";
import { primaryActionClassName } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <PageNotice
      action={
        <Link className={cn(buttonVariants({ size: "lg" }), primaryActionClassName)} href="/">
          <ChevronLeft aria-hidden="true" />
          Back to Discover
        </Link>
      }
      role="status"
      title="We couldn’t find that page."
    >
      The link may be old or mistyped. Head back to discover your next movie night.
    </PageNotice>
  );
}
