import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProductForm from "../_components/ProductForm";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string }>;
}) {
  const { storeId, productId } = await params;
  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return redirect("/sign-in");
  }

  const product = await db.query.ProductTable.findFirst({
    where: and(
      eq(ProductTable.id, productId) && eq(ProductTable.storeId, storeId)
    ),
    with: {
      productItems: {
        with: {
          availableItems: {
            orderBy: desc(ProductTable.createdAt),
          },
        },
      },
    },
  });

  if (!product) {
    return redirect(`/dashboard/${storeId}/products`);
  }

  product.productItems[0].colorIds

  return (
    <Container>
      <Heading title="Edit Product" description={`Editing ${product.name}`} />

      <Separator className="my-4" />

      <ProductForm data={product} currentUser={user} />
    </Container>
  );
}
