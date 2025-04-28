import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import BannerForm from "../_components/BannerForm";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { BannerTable } from "@/drizzle/schema";

export default async function BannerPage({
  params,
}: {
  params: Promise<{ storeId: string; bannerId: string }>;
}) {
  const { bannerId, storeId } = await params;

  const banner = await db.query.BannerTable.findFirst({
    where: and(eq(BannerTable.id, bannerId), eq(BannerTable.storeId, storeId)),
  });

  if (!banner) {
    return redirect(`/dashboard/${storeId}/banners`);
  }

  return (
    <Container>
      <Heading title="Edit Banner" description={`Editing ${banner.name}`} />

      <Separator className="my-4" />

      <BannerForm data={banner} />
    </Container>
  );
}
