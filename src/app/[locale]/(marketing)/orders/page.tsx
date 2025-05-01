import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getUserOrdersByStatus } from "@/features/orders/db/orders";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/services/clerk";
import { userRoles } from "@/drizzle/schema";

export default async function OrdersPage({
  searchParams: { status },
}: {
  searchParams: { status: string };
}) {
  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return redirect("/sign-in");
  }

  if (user.role !== userRoles[0]) {
    return redirect("/");
  }

  const orders = await getUserOrdersByStatus({
    userId: user.id,
    status,
  });

  return (
    <Container>
      <Heading title="Your Orders" description="View all orders" />

      <Separator className="my-4" />

      <DataTable
        columns={columns}
        data={orders}
        isUserOrders
        userOrderPath="/orders"
      />
    </Container>
  );
}
