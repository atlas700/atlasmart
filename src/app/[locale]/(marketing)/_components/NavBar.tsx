import Link from "next/link";
import SearchBar from "./SearchBar";
import Logo from "@/components/Logo";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import UserAccount from "@/components/UserAccount";
import { Locale } from "../../../../../i18n";
import { getTranslation } from "@/lib/i18n/getTranslation";
import LocaleSelector from "@/components/locale-selector";

export default async function NavBar({ locale }: { locale: Locale }) {
  const translation = await getTranslation(locale);

  const { user } = { user: { id: "1", role: "ADMIN" } };

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

          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <UserAccount />

              {/* <Cart /> */}
            </div>
          ) : (
            <Button variant="outline" data-testid="nav-sign-in-btn">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
          <LocaleSelector message={translation("nav.localeSelector.message")} />
        </div>
      </Container>
    </nav>
  );
}
