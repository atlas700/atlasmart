import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { userRoles } from "@/drizzle/schema";
import { getTranslation } from "@/lib/i18n/getTranslation";
import { getCurrentUser } from "@/services/clerk";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Locale } from "../../../../i18n";
import SearchBar from "./_components/SearchBar";
import { getHomePageProducts } from "@/features/products/db/products";
import Feed from "./_components/Feed";

type Props = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const translation = await getTranslation(locale);

  const { user } = await getUser();
  const products = await getHomePageProducts();

  console.log(products);

  return (
    <Suspense>
      <div className="w-full space-y-10">
        <div className="bg-white w-full h-[70vh] flex items-center justify-center">
          <div className="flex flex-col gap-4 items-center text-center">
            <Container>
              <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
                <h1 className="text-4xl sm:text-6xl text-gray-900 font-bold tracking-tight">
                  {translation("views.home.title")}
                </h1>

                <p className="max-w-prose text-lg text-gray-500">
                  {translation("views.home.body")}
                </p>

                {user?.role === userRoles[0] && (
                  <Link href="/store" data-cy="become-a-seller">
                    <Button
                      variant="default"
                      aria-label="Click to become a seller"
                    >
                      Become a Seller <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                )}

                {user?.role === userRoles[2] && (
                  <Link href="/store" data-cy="go-to-store">
                    <Button variant="default" aria-label="Click to go to store">
                      Go to Store <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                )}

                {user?.role === userRoles[1] && (
                  <Link href="/admin">
                    <Button
                      variant="default"
                      aria-label="Click to go to dashboard"
                    >
                      Go to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                )}

                {!user && (
                  <div className="flex items-center gap-3">
                    <Link href="/auth/sign-in">
                      <Button
                        variant="default"
                        aria-label="Click to go to sign in"
                      >
                        Sign In
                      </Button>
                    </Link>

                    <Link href="/auth/sign-up">
                      <Button
                        variant="outline"
                        aria-label="Click to go to register"
                      >
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Container>
          </div>
        </div>

        <div className="w-full max-w-lg px-4 md:hidden">
          <SearchBar />
        </div>

        <Container>
          <Heading title="Products" description="View all product" />

          <div className="my-4" />

          <Feed initialData={products} />
        </Container>
      </div>
    </Suspense>
  );
}

async function getUser() {
  return getCurrentUser({ allData: true });
}
