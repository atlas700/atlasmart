import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import CategoryForm from "../_components/CategoryForm";

export default async function CategoryPage({
  params,
}: {
  params: { storeId: string; id: string };
}) {
  const { id, storeId } = params;

  const category = await prismadb.category.findUnique({
    where: {
      id,
      storeId,
    },
  });

  if (!category) {
    return redirect(`/dashboard/${storeId}/categories`);
  }

  return (
    <Container>
      <Heading title="Edit Category" description={`Editing ${category.name}`} />

      <Separator className="my-4" />

      <CategoryForm data={category} />
    </Container>
  );
}
