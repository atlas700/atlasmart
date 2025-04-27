import Link from "next/link";
import { Plus } from "lucide-react";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { buttonVariants } from "@/components/ui/button";
import { getBannersByStoreId } from "@/features/store/db/store";

export default async function StoreBannersPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const banners = await getBannersByStoreId(storeId);

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <Heading
            title={`Banners (${banners.length})`}
            description="Manage your store banners"
          />

          <Link
            href={`/dashboard/${storeId}/banners/new`}
            className={buttonVariants()}
            data-cy="new-banner-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new
          </Link>
        </div>

        <Separator className="my-4" />

        <DataTable columns={columns} data={banners} searchKey="name" />
      </Container>
    </div>
  );
}
