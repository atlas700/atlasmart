import Heading from "@/components/Heading";
import Container from "@/components/Container";
import ColorForm from "../_components/ColorForm";
import { Separator } from "@/components/ui/separator";

export default function NewColor() {
  return (
    <Container>
      <Heading
        title="New Color"
        description="Create a new color for your store"
      />

      <Separator className="my-4" />

      <ColorForm />
    </Container>
  );
}
