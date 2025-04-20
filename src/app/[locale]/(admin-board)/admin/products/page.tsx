import { currentUser } from "@/lib/auth";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getProductsByAdmin } from "@/data/product";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: {
    status: string;
  };
}) {
  const { status } = searchParams;

  const { user } = await currentUser();

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
        columns={columns}
        data={products}
        searchKey="name"
        isProducts
      />
    </Container>
  );
}
