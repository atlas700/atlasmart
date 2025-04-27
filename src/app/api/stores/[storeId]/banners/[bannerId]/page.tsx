import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import BannerForm from "../_components/BannerForm";
import { Separator } from "@/components/ui/separator";

export default async function BannerPage({
  params,
}: {
  params: { storeId: string; bannerId: string };
}) {
  const { bannerId, storeId } = params;

  const banner = await prismadb.banner.findUnique({
    where: {
      id: bannerId,
      storeId,
    },
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
