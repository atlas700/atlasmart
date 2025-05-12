import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getProductsByAdmin } from "@/features/products/db/products";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/services/clerk";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status: string;
  }>;
}) {
  const { status } = await searchParams;

  const { user } = await getCurrentUser({ allData: true });

  const products = await getProductsByAdmin({
    userRole: user?.role,
    status,
  });

  return (
    <Container>
      <Heading
        title="Products"
        description="Review and manage product status."
      />

      <Separator className="my-4" />

      <DataTable
        // @ts-ignore
        columns={columns}
        data={products}
        searchKey="name"
        isProducts
      />
    </Container>
  );
}
