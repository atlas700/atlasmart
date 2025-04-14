import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { Locale } from "../../../../i18n";
import NavBar from "./_components/NavBar";

type Props = {
  children: Readonly<React.ReactNode>;
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function MarketingLayout({ children, params }: Props) {
  const { locale } = await params;

  const headerList = headers();
  const pathname = (await headerList).get("x-current-path");

  return (
    <div
      className={cn(
        "relative flex flex-col min-h-full w-full bg-gray-100",
        pathname === "/orders" && "bg-white"
      )}
    >
      <NavBar locale={locale} />

      <main className="flex-1 flex-grow py-20">{children}</main>

      <Footer />
    </div>
  );
}
