import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import SizeForm from "../_components/SizeForm";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";

export default async function SizePage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  const { sizeId, storeId } = params;

  const size = await prismadb.size.findUnique({
    where: {
      id: sizeId,
      storeId,
    },
  });

  if (!size) {
    return redirect(`/dashboard/${storeId}/sizes`);
  }

  return (
    <Container>
      <Heading title="Edit Size" description={`Editing ${size.name}`} />

      <Separator className="my-4" />

      <SizeForm data={size} />
    </Container>
  );
}
