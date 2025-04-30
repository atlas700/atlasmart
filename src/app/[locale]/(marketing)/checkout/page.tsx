import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import CheckoutContent from "./_components/CheckoutContent";
import { getCurrentUser } from "@/services/clerk";
import { userRoles } from "@/drizzle/schema";

export default async function CheckoutPage() {
  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return redirect("/sign-in");
  }

  if (user.role !== userRoles[0]) {
    return redirect("/");
  }

  return (
    <Container>
      <Heading title="Checkout" description="Finalize Your Purchase" />

      <Separator className="my-4" />

      <CheckoutContent />
    </Container>
  );
}
