import { redirect } from "next/navigation";
import { getFirstStoreByUserId } from "@/features/store/db/store";
import NavBar from "./_components/NavBar";
import { getCurrentUser } from "@/services/clerk";

const CreateStoreLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return redirect("/sign-in");
  }

  const role = user.role;

  if (role === "ADMIN") {
    return redirect("/");
  }

  const store = await getFirstStoreByUserId(user.id);

  if (store) {
    return redirect(`/dashboard/${store.id}`);
  }

  return (
    <div className="relative min-h-full w-full bg-gray-100">
      <NavBar />

      <main className="pt-20 pb-10">{children}</main>
    </div>
  );
};

export default CreateStoreLayout;
