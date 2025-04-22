import Link from "next/link";
import { Plus } from "lucide-react";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { getCategoriesByStoreId } from "@/data/store";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

export default async function StoreCategoriesPage({
  params: { storeId },
}: {
  params: { storeId: string };
}) {
  const categories = await getCategoriesByStoreId(storeId);

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <Heading
            title={`Categories (${categories.length})`}
            description="Manage your store categories"
          />

          <Link
            href={`/dashboard/${storeId}/categories/new`}
            className={buttonVariants()}
            data-cy="new-category-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new
          </Link>
        </div>

        <Separator className="my-4" />

        <DataTable columns={columns} data={categories} searchKey="name" />
      </Container>
    </div>
  );
}
