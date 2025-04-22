import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { getStoreOrdersByStatus } from "@/data/orders";
import { DataTable } from "@/components/ui/data-table";

export default async function StoreOrderPage({
  params: { storeId },
  searchParams: { status },
}: {
  params: { storeId: string };
  searchParams: { status: string };
}) {
  const orders = await getStoreOrdersByStatus({
    storeId,
    status,
  });

  return (
    <Container>
      <Heading title="Orders" description="View all orders for your products" />

      <Separator className="my-4" />

      <DataTable
        columns={columns}
        data={orders}
        isUserOrders
        userOrderPath={`/dashboard/${storeId}/orders`}
      />
    </Container>
  );
}
