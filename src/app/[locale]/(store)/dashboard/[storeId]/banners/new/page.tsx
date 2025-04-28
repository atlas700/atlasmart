import Heading from "@/components/Heading";
import Container from "@/components/Container";
import BannerForm from "../_components/BannerForm";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/services/clerk";
import { redirect } from "next/navigation";

export default async function NewBanner() {
  const { user } = await getCurrentUser();

  return (
    <Container>
      <Heading
        title="New Banner"
        description="Create a new banner for your store"
      />

      <Separator className="my-4" />

      <BannerForm currentUser={{ id: user?.id, name: user?.name }} />
    </Container>
  );
}
