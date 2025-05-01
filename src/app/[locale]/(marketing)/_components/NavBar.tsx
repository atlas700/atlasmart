import Container from "@/components/Container";
import LocaleSelector from "@/components/locale-selector";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { userRoles } from "@/drizzle/schema";
import { getTranslation } from "@/lib/i18n/getTranslation";
import { getCurrentUser } from "@/services/clerk";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { Locale } from "../../../../../i18n";
import SearchBar from "./SearchBar";
import Cart from "@/components/cart/Cart";

export default async function NavBar({ locale }: { locale: Locale }) {
  const translation = await getTranslation(locale);

  const { user } = await getUser();

  return (
    <nav
      dir="LTR"
      className="fixed top-0 inset-x-0 z-40 bg-white h-16 flex items-center border-b border-gray-200 shadow-sm"
    >
      <Container>
        <div className="flex items-center justify-between gap-5">
          <Logo />

          <div className="hidden md:flex md:flex-1 max-w-lg">
            <SearchBar />
          </div>

          <Suspense>
            {user?.id ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {user.role === userRoles[1] && (
                  <Button asChild size={"sm"} variant={"ghost"}>
                    <Link href={"/admin"}>Admin Dashboard</Link>
                  </Button>
                )}
                <UserButton />
                {user.role === userRoles[0] && (
                  <Button asChild size={"sm"} variant={"ghost"}>
                    <Link href={"/orders"}>My Orders</Link>
                  </Button>
                )}
                <Suspense>
                  <Cart currentUser={{ id: user.id, role: user.role }} />
                </Suspense>
              </div>
            ) : (
              <Button variant="outline" data-testid="nav-sign-in-btn">
                <Link href={`${locale}/sign-in`}>Sign In</Link>
              </Button>
            )}
          </Suspense>
          <LocaleSelector message={translation("nav.localeSelector.message")} />
        </div>
      </Container>
    </nav>
  );
}

async function getUser() {
  return await getCurrentUser({ allData: true });
}
