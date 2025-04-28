import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import Container from "@/components/Container";
import { Separator } from "@/components/ui/separator";
import CategoryForm from "../_components/CategoryForm";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { CategoryTable } from "@/drizzle/schema";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>;
}) {
  const { id, storeId } = await params;

  const category = await db.query.CategoryTable.findFirst({
    where: and(eq(CategoryTable.storeId, storeId), eq(CategoryTable.id, id)),
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
