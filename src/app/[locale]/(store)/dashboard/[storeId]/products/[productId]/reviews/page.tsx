import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import AverageRating from "@/components/AverageRating";
import { db } from "@/drizzle/db";
import { and, desc, eq } from "drizzle-orm";
import { ProductTable, ReviewTable } from "@/drizzle/schema";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string }>;
}) {
  const { productId, storeId } = await params;
  const product = await db.query.ProductTable.findFirst({
    where: and(
      eq(ProductTable.id, productId),
      eq(ProductTable.storeId, storeId),
      eq(ProductTable.status, "APPROVED")
    ),
    columns: {
      name: true,
    },
  });

  if (!product) {
    return redirect(`/dashboard/${storeId}/products`);
  }

  const reviews = await db.query.ReviewTable.findMany({
    where: and(
      eq(ReviewTable.storeId, storeId),
      eq(ReviewTable.productId, productId)
    ),
    orderBy: desc(ReviewTable.createdAt),
  });

  return (
    <div className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <Heading title={product.name} description="View product reviews." />

          {reviews.length > 0 && (
            <div className="flex flex-col md:flex-row space-x-2">
              <span className="text-sm font-semibold">Average Rating:</span>

              <AverageRating ratings={reviews.map((review) => review.value)} />
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <DataTable columns={columns} data={reviews} searchKey="reason" />
      </Container>
    </div>
  );
}
