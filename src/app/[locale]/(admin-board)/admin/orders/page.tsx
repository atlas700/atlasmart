import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { getAdminOrdersByStatus } from "@/features/orders/db/orders";
import { getCurrentUser } from "@/services/clerk";
import { userRoles } from "@/drizzle/schema";
import { Suspense } from "react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status: string;
  }>;
}) {
  const { status } = await searchParams;
  const { user } = await getCurrentUser({ allData: true });

  if (!user || user.role !== userRoles[1]) {
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

      <Suspense>
        <DataTable
          columns={columns}
          data={orders}
          isUserOrders
          userOrderPath="/admin/orders"
        />
      </Suspense>
    </Container>
  );
}
