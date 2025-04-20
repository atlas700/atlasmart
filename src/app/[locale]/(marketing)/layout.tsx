import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
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

  return (
    <div className={cn("relative flex flex-col min-h-full w-full bg-gray-100")}>
      <NavBar locale={locale} />

      <main className="flex-1 flex-grow py-20">{children}</main>

      <Footer />
    </div>
  );
}
