import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { columns } from "./_components/Columns";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import AverageRating from "@/components/AverageRating";

export default async function ReviewsPage({
  params: { storeId, productId },
}: {
  params: { storeId: string; productId: string };
}) {
  const product = await prismadb.product.findUnique({
    where: {
      id: productId,
      storeId,
      status: "APPROVED",
    },
    select: {
      name: true,
    },
  });

  if (!product) {
    return redirect(`/dashboard/${storeId}/products`);
  }

  const reviews = await prismadb.review.findMany({
    where: {
      storeId,
      productId,
    },
    orderBy: {
      createdAt: "desc",
    },
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
