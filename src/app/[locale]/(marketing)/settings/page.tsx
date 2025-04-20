import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="w-full min-h-screen space-y-10">
      <Container className="flex flex-col gap-8">
        <Heading title="Settings" description="Change your personal data" />
        <UserProfile />
      </Container>
    </div>
  );
}
