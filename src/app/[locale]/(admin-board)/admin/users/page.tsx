import { getUsersByAdmin } from "@/features/users/db/users";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import Heading from "@/components/Heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/services/clerk";

export default async function AdminUsersPage() {
  const { user } = await getCurrentUser({ allData: true });

  const users = await getUsersByAdmin({
    userId: user?.id,
    userRole: user?.role,
  });

  return (
    <Container>
      <Heading title="Users" description="View all Users" />

      <Separator className="my-4" />

      <DataTable columns={columns} data={users} searchKey="name" />
    </Container>
  );
}
