import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { getAdminOrdersByStatus } from "@/data/orders";

export default async function AdminOrdersPage({
  searchParams: { status },
}: {
  searchParams: {
    status: string;
  };
}) {
  const { user } = await currentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const orders = await getAdminOrdersByStatus({
    userId: user.id,
    status,
  });

  return (
    <Container>
      <Heading title="Orders" description="Review and manage orders." />

      <Separator className="my-4" />

      <DataTable
        columns={columns}
        data={orders}
        isUserOrders
        userOrderPath="/admin/orders"
      />
    </Container>
  );
}
