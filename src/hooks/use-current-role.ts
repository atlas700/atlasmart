import { getCurrentUser } from "@/services/clerk";

const useCurrentRole = async () => {
  const { role } = await getCurrentUser();

  return { role };
};

export default useCurrentRole;
