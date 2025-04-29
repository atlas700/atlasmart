import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { storeStatuses } from "@/drizzle/schema";
import {
  getNumOfProductsInStock,
  getSalesCountByStoreId,
  getStore,
  getStoreBanner,
  getTotalRevenue,
} from "@/features/store/db/storeOverview";
import { cn, formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/services/clerk";
import { CreditCard, Package, PoundSterling } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Locale } from "../../../../../../i18n";
import RevenueGraph from "../_components/RevenueGraph";
import ShareStoreLink from "../_components/ShareStoreLink";

export default async function StoreDashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale; storeId: string }>;
}) {
  const { storeId } = await params;
  const { locale } = await params;

  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return redirect("/sign-in");
  }

  const store = await getStore({ userId: user?.id, storeId });

  if (!store) {
    return redirect("/store");
  }

  const banner = await getStoreBanner({ storeId });

  const totalRevenue = await getTotalRevenue({ storeId });

  const salesCount = await getSalesCountByStoreId({ storeId });

  const productInStock = await getNumOfProductsInStock({ storeId });

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between gap-3">
          <Heading title={store.name} description="Overview of your store" />

          {store.status === storeStatuses[2] && (
            <ShareStoreLink storeId={storeId} />
          )}
        </div>

        {banner?.image && <div className="my-4" />}

        {!banner?.image && <Separator className="my-4" />}
      </Container>

      {banner?.image && (
        <div className="relative w-full aspect-square md:aspect-video lg:h-[65vh] overflow-hidden mb-10">
          <Image
            className="object-cover"
            src={banner?.image}
            fill
            alt="banner-img"
          />
        </div>
      )}

      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-bold">Total Revenue</CardTitle>

              <PoundSterling className="h-5 w-5 text-violet-500 font-bold" />
            </CardHeader>

            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  totalRevenue > 0 && "text-green-500"
                )}
              >
                {formatPrice(totalRevenue, {
                  currency: "USD",
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-bold">Sales</CardTitle>

              <CreditCard className="h-5 w-5 text-violet-500 font-bold" />
            </CardHeader>

            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  salesCount > 0 && "text-green-500"
                )}
              >
                {salesCount > 0 && "+"}
                {salesCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-bold">Products in Stocks</CardTitle>

              <Package className="h-5 w-5 text-violet-500 font-bold" />
            </CardHeader>

            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  productInStock > 0 && "text-green-500"
                )}
              >
                {productInStock > 0 && "+"}
                {productInStock}
              </div>
            </CardContent>
          </Card>
        </div>

        <RevenueGraph storeId={storeId} />
      </Container>
    </div>
  );
}
