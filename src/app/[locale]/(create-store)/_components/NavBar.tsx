"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/Container";

const NavBar = () => {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white h-16 flex items-center border-b border-gray-200 shadow-sm">
      <Container>
        <div className="flex items-center gap-5">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <Logo />
        </div>
      </Container>
    </nav>
  );
};

export default NavBar;
