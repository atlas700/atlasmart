import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import ProductForm from "../_components/ProductForm";

export default async function ProductPage({
  params: { storeId, productId },
}: {
  params: { storeId: string; productId: string };
}) {
  const product = await prismadb.product.findUnique({
    where: {
      id: productId,
      storeId,
    },
    include: {
      productItems: {
        include: {
          availableItems: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    return redirect(`/dashboard/${storeId}/products`);
  }

  return (
    <Container>
      <Heading title="Edit Product" description={`Editing ${product.name}`} />

      <Separator className="my-4" />

      <ProductForm data={product} />
    </Container>
  );
}
