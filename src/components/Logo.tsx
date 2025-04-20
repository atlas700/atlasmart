import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Nunito_Sans } from "next/font/google";

const font = Nunito_Sans({
  subsets: ["latin"],
  weight: ["600"],
});

const Logo = () => {
  return (
    <Link href="/" data-testid="logo">
      <div className="flex items-center gap-2">
        <span className={cn("text-4xl font-semibold", font.className)}>🛍</span>

        <span className="font-medium">AtlasMart</span>
      </div>
    </Link>
  );
};

export default Logo;
