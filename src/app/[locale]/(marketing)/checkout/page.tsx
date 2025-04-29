import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import CheckoutContent from "./_components/CheckoutContent";

export default async function CheckoutPage() {
  const { user } = await currentUser();

  if (!user) {
    return redirect("/auth/sign-in");
  }

  if (user.role !== UserRole.USER) {
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
