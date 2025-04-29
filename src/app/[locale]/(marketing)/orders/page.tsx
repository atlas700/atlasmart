import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getUserOrdersByStatus } from "@/data/orders";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

export default async function OrdersPage({
  searchParams: { status },
}: {
  searchParams: { status: string };
}) {
  const { user } = await currentUser();

  if (!user) {
    return redirect("/auth/sign-in");
  }

  if (user.role !== UserRole.USER) {
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
