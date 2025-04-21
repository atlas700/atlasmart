"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  href: string;
};

export const BackBtn = ({ label, href }: Props) => {
  return (
    <Button
      className="w-full"
      variant="link"
      size="sm"
      asChild
      data-cy="back-btn"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};
