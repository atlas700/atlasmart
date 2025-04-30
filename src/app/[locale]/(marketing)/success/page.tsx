import Container from "@/components/Container";
import { userRoles } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk";
import { redirect } from "next/navigation";
import SuccessComponent from "./page.client";

export default async function SuccessPage() {
  const { user } = await getCurrentUser({ allData: true });

  if (!user || user.role !== userRoles[0]) {
    return redirect("/");
  }

  return (
    <div className="bg-white w-full h-[70vh] flex items-center justify-center">
      <Container>
        <SuccessComponent />
      </Container>
    </div>
  );
}
