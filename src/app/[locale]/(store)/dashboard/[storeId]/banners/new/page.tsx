import Heading from "@/components/Heading";
import Container from "@/components/Container";
import BannerForm from "../_components/BannerForm";
import { Separator } from "@/components/ui/separator";

export default function NewBanner() {
  return (
    <Container>
      <Heading
        title="New Banner"
        description="Create a new banner for your store"
      />

      <Separator className="my-4" />

      <BannerForm />
    </Container>
  );
}
