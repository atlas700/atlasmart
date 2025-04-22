import Heading from "@/components/Heading";
import Container from "@/components/Container";
import ViewVideo from "../_components/ViewVideo";
import ProductForm from "../_components/ProductForm";
import { Separator } from "@/components/ui/separator";

export default function NewProductPage() {
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

      <ProductForm />
    </Container>
  );
}
