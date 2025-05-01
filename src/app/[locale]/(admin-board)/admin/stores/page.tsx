import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { getStoresByAdmin } from "@/features/store/db/store";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/services/clerk";

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    status: string;
  }>;
}) {
  const { status } = await searchParams;

  const { user } = await getCurrentUser({ allData: true });

  const stores = await getStoresByAdmin({
    userRole: user?.role,
    status,
  });

  console.log(status);

  return (
    <Container>
      <Heading title="Stores" description="Review and manage store status." />

      <Separator className="my-4" />

      <DataTable columns={columns} data={stores} searchKey="name" isStores />
    </Container>
  );
}
