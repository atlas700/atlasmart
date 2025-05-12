import Container from "@/components/Container";
import { getProductById } from "@/features/products/db/products";
import { getCurrentUser } from "@/services/clerk";
import { redirect } from "next/navigation";
import ProductContent from "./_components/ProductContent";
import Recommendation from "./_components/Recommendation";
import Reviews from "./_components/reviews/Reviews";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await getProductById(productId);

  if (!product) {
    return redirect("/");
  }

  const { user } = await getCurrentUser({ allData: true });
  return (
    <div className="w-full space-y-5">
      <Container>
        <ProductContent user={user} product={product} />
      </Container>

      <Recommendation
        product={{
          id: product.id,
          name: product.name,
          category: {
            name: product?.category?.name,
          },
        }}
      />

      <Reviews
        productId={productId}
        currentUser={{ role: user?.role, id: user?.id }}
      />
    </div>
  );
}
