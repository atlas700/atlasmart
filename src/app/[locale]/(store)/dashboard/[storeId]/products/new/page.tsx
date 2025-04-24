import Heading from "@/components/Heading";
import Container from "@/components/Container";
import ViewVideo from "../_components/ViewVideo";
import ProductForm from "../_components/ProductForm";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/services/clerk";

export default async function NewProductPage() {
  const { user, redirectToSignIn } = await getCurrentUser({ allData: true });
  if (!user) {
    return redirectToSignIn();
  }

  return (
    <Container>
      <div className="flex items-center justify-between gap-3">
        <Heading
          title="New Product"
          description="Create a new product for your store"
        />

        <ViewVideo />
      </div>

      <Separator className="my-4" />

      <ProductForm currentUser={user} />
    </Container>
  );
}
