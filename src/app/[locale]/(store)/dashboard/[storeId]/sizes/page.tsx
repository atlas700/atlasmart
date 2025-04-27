import Link from "next/link";
import { Plus } from "lucide-react";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getSizesByStoreId } from "@/features/store/db/store";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { buttonVariants } from "@/components/ui/button";

export default async function SizesPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const sizes = await getSizesByStoreId(storeId);

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <Heading
            title={`Sizes (${sizes.length})`}
            description="Manage your store sizes"
          />

          <Link
            href={`/dashboard/${storeId}/sizes/new`}
            className={buttonVariants()}
            data-cy="new-size-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new
          </Link>
        </div>

        <Separator className="my-4" />

        <DataTable columns={columns} data={sizes} searchKey="name" />
      </Container>
    </div>
  );
}
