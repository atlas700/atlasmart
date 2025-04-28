import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import SizeForm from "../_components/SizeForm";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { SizeTable } from "@/drizzle/schema";

export default async function SizePage({
  params,
}: {
  params: Promise<{ storeId: string; sizeId: string }>;
}) {
  const { sizeId, storeId } = await params;

  const size = await db.query.SizeTable.findFirst({
    where: and(eq(SizeTable.storeId, storeId), eq(SizeTable.id, sizeId)),
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
