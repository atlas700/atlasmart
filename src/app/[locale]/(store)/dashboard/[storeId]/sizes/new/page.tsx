import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import SizeForm from "../_components/SizeForm";

export default function NewSize() {
  return (
    <Container>
      <Heading
        title="New Size"
        description="Create a new size for your store"
      />

      <Separator className="my-4" />

      <SizeForm />
    </Container>
  );
}
