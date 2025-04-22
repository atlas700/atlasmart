import Header from "./_components/header/Header";
import { redirect } from "next/navigation";
import { getStoresByUserId } from "@/features/store/db/store";
import { getCurrentUser } from "@/services/clerk";
import { Locale } from "../../../../../i18n";

const StoreDashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale; storeId: string }>;
}) => {
  const { storeId } = await params;
  const { locale } = await params;

  const { user } = await getCurrentUser({ allData: true });

  const role = user?.role;

  if (!user) {
    return redirect("/sign-in");
  }

  if (role !== "SELLER") {
    return redirect("/");
  }

  const stores = await getStoresByUserId({ userId: user.id });

  if (stores.length === 0) {
    return redirect("/store");
  }

  return (
    <div className="relative min-h-full w-full bg-white">
      <Header stores={stores} user={user} />

      <main className="py-6">{children}</main>
    </div>
  );
};

export default StoreDashboardLayout;
