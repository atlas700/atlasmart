import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import ColorForm from "../_components/ColorForm";
import { Separator } from "@/components/ui/separator";

export default async function ColorPage({
  params,
}: {
  params: { storeId: string; colorId: string };
}) {
  const { colorId, storeId } = params;

  const color = await prismadb.color.findUnique({
    where: {
      id: colorId,
      storeId,
    },
  });

  if (!color) {
    return redirect(`/dashboard/${storeId}/colors`);
  }

  return (
    <Container>
      <Heading title="Edit Color" description={`Edit ${color.name}`} />

      <Separator className="my-4" />

      <ColorForm data={color} />
    </Container>
  );
}
