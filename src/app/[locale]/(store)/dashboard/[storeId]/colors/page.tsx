import Link from "next/link";
import { Plus } from "lucide-react";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getColorsByStoreId } from "@/data/store";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { buttonVariants } from "@/components/ui/button";

export default async function ColorsPage({
  params: { storeId },
}: {
  params: { storeId: string };
}) {
  const colors = await getColorsByStoreId(storeId);

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <Heading
            title={`Colors (${colors.length})`}
            description="Manage your store colors"
          />

          <Link
            href={`/dashboard/${storeId}/colors/new`}
            className={buttonVariants()}
            data-cy="new-color-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new
          </Link>
        </div>

        <Separator className="my-4" />

        <DataTable columns={columns} data={colors} searchKey="name" />
      </Container>
    </div>
  );
}
