import Container from "@/components/Container";
import { Locale } from "../../../../../../i18n";

export default async function ProductPage({
  params,
  locale,
}: {
  params: Promise<{ productId: string }>;
  locale: Locale;
}) {
  const productId = await params;

  return (
    <div className="w-full space-y-5">
      <Container>asasasas</Container>
    </div>
  );
}
