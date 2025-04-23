import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import NotApproved from "./_components/NotApproved";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { buttonVariants } from "@/components/ui/button";
import { getProductsByStoreId, getStore } from "@/features/store/db/store";
import { getCurrentUser } from "@/services/clerk";
import { storeStatuses } from "@/drizzle/schema";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const store = await getStore({ userId: user.id, storeId });

  if (!store) {
    return redirect("/store");
  }

  if (store.status !== storeStatuses[2]) {
    return (
      <div className="w-full h-[calc(100vh-110px)] flex items-center justify-center">
        <NotApproved
          status={store.status}
          statusFeedback={store.statusFeedback!}
        />
      </div>
    );
  }

  const products = await getProductsByStoreId({ userId: user.id, storeId });

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <Heading
            title={`Products (${products.length})`}
            description="Manage products in your store"
          />

          <Link
            href={`/dashboard/${storeId}/products/new`}
            className={buttonVariants()}
            data-cy="new-product-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new
          </Link>
        </div>

        <Separator className="my-4" />

        <DataTable columns={columns} data={products} searchKey="name" />
      </Container>
    </div>
  );
}
