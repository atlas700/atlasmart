"use client";

import Container from "@/components/Container";
import StoreForm from "@/components/StoreForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateStorePage() {
  return (
    <Container>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Become a seller</CardTitle>

          <CardDescription>Create your store.</CardDescription>
        </CardHeader>

        <CardContent>
          <StoreForm />
        </CardContent>
      </Card>
    </Container>
  );
}
