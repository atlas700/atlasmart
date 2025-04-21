"use client";

import React from "react";
import Socials from "./Socials";
import { Header } from "./Header";
import { BackBtn } from "./BackBtn";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
  showSocial?: boolean;
  headerLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
};

const CardWrapper = ({
  children,
  showSocial,
  headerLabel,
  secondaryLabel,
  secondaryHref,
}: Props) => {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>

      <CardContent>{children}</CardContent>

      {showSocial && (
        <CardFooter>
          <Socials />
        </CardFooter>
      )}

      <CardFooter>
        <BackBtn label={secondaryLabel} href={secondaryHref} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
