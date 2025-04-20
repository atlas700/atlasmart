import { redirect } from "next/navigation";
import AdminNav from "./_components/nav/AdminNav";
import { getCurrentUser } from "@/services/clerk";
import { Locale } from "../../../../i18n";
import { getTranslation } from "@/lib/i18n/getTranslation";

export default async function AdminDashboardLayout({
  params,
  children,
}: {
  params: Promise<{ locale: Locale }>;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser({ allData: true });
  const { locale } = await params;
  const translations = await getTranslation(locale);

  const role = user.role;

  if (!user) {
    return redirect("/sign-in");
  }

  if (role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="relative min-h-full w-full bg-white">
      <AdminNav
        user={{
          name: user.user?.name,
          imageUrl: user.user?.imageUrl,
          role: user.role,
        }}
      />

      <main className="py-6">{children}</main>
    </div>
  );
}
