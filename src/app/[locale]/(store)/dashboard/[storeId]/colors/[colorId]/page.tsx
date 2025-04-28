import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import ColorForm from "../_components/ColorForm";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { ColorTable } from "@/drizzle/schema";

export default async function ColorPage({
  params,
}: {
  params: Promise<{ storeId: string; colorId: string }>;
}) {
  const { colorId, storeId } = await params;

  const color = await db.query.ColorTable.findFirst({
    where: and(eq(ColorTable.id, colorId), eq(ColorTable.storeId, storeId)),
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
