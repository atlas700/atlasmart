import Image from "next/image";
import { redirect } from "next/navigation";
import { MdVerified } from "react-icons/md";
import Container from "@/components/Container";
import StoreFeed from "./_components/StoreFeed";
import { Separator } from "@/components/ui/separator";
import ProductFilters from "./_components/ProductFilters";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getProductStore, getStoreProducts } from "@/data/store-products";

export default async function StorePage({
  params: { storeId },
  searchParams: { search },
}: {
  params: { storeId: string };
  searchParams: {
    search: string;
  };
}) {
  const store = await getProductStore(storeId);

  if (!store) {
    return redirect("/");
  }

  //Fetch initial products
  const products = await getStoreProducts({
    storeId,
    search,
  });

  return (
    <div className="w-full space-y-10">
      <div className="relative w-full h-40 md:h-[50vh] bg-white overflow-hidden border-b shadow-sm">
        {store?.Banners?.[0]?.image! ? (
          <Image
            className="object-cover"
            src={store.Banners[0].image}
            fill
            alt="store-banner"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
              <h1 className="text-4xl sm:text-6xl text-gray-900 font-bold tracking-tight">
                High-Quality <span className="text-violet-500">Products</span>{" "}
                You Can Trust, Every Time.
              </h1>

              <p className="max-w-prose text-lg text-gray-500">
                AtlasMart 🛍 - your trusted source for top-quality products. We
                check everything to make sure it&apos;s the best you can find!
              </p>
            </div>
          </div>
        )}
      </div>

      <Container>
        <div className="flex items-center gap-2">
          <Avatar className="w-20 h-20">
            <AvatarImage src={store.logo || "/no-profile.jpeg"} />
          </Avatar>

          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold">{store.name}</h2>

            {store.emailVerified && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Verified</span>

                <MdVerified className="w-4 h-4 text-violet-500" />
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {store.description && (
          <p className="w-full text-sm text-gray-500 max-w-2xl">
            {store.description}
          </p>
        )}

        <main className="mt-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-2xl font-bold">Products</h1>

            <ProductFilters storeId={storeId} />
          </div>

          <StoreFeed
            storeId={storeId}
            initialData={products}
            searchValue={search}
          />
        </main>
      </Container>
    </div>
  );
}
