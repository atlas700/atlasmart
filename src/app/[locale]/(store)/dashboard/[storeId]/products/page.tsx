import Link from "next/link";
import { Plus } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import { storeStatus } from "@prisma/client";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import NotApproved from "./_components/NotApproved";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { buttonVariants } from "@/components/ui/button";
import { getProductsByStoreId, getStore } from "@/data/store";

export default async function ProductsPage({
  params: { storeId },
}: {
  params: { storeId: string };
}) {
  const { user } = await currentUser();

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const store = await getStore({ userId: user.id, storeId });

  if (!store) {
    return redirect("/store");
  }

  if (store.status !== storeStatus.APPROVED) {
    return (
      <div className="w-full h-[calc(100vh-110px)] flex items-center justify-center">
        <NotApproved
          status={store.status}
          statusFeedback={store.statusFeedback}
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
