import { getCurrentUser } from "@/services/clerk";

const useCurrentUser = async () => {
  const session = await getCurrentUser({ allData: true });

  return { user: session };
};

export default useCurrentUser;
