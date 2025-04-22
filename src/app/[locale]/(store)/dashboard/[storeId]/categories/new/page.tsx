import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import CategoryForm from "../_components/CategoryForm";

export default function NewCategory() {
  return (
    <Container>
      <Heading
        title="New Category"
        description="Create a new category for your store"
      />

      <Separator className="my-4" />

      <CategoryForm />
    </Container>
  );
}
