import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/services/clerk";
import { cn } from "@/lib/utils";
import { getUsersCount } from "@/services/admin-overview";

export default async function AdminPage() {
  const { user } = await getCurrentUser({ allData: true });

  const users = await getUsersCount();
  const usersCount = users.length;

  return (
    <div className="w-full">
      <Container>
        <Heading
          title={`${user?.name}(Admin)`}
          description="Overview of the website."
        />

        <Separator className="my-4" />

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Users</h1>

              <Link href="/admin/users">
                <Button variant={"violet"}>View All</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="font-bold">Verified Users</CardTitle>

                  <Users className="h-5 w-5 text-violet-500 font-bold" />
                </CardHeader>

                <CardContent>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      usersCount > 0 && "text-green-500"
                    )}
                  >
                    {usersCount > 0 && "+"}
                    {usersCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="font-bold">
                    Non-Verified Users
                  </CardTitle>

                  <Users className="h-5 w-5 text-violet-500 font-bold" />
                </CardHeader>

                <CardContent>
                  {/* <div
                    className={cn(
                      "text-2xl font-bold",
                      nonVerifiedUserCount > 0
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {nonVerifiedUserCount > 0 && "+"}
                    {nonVerifiedUserCount}
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* <DataChart
            title="Stores"
            href="/admin/stores"
            hrefText="View All"
            queryKey={["get-stores-chart-data"]}
            getData={getStoreChartData}
          /> */}

          {/* <DataChart
            title="Products"
            href="/admin/products"
            hrefText="View All"
            queryKey={["get-products-chart-data"]}
            getData={getProductChartData}
          /> */}
        </div>
      </Container>
    </div>
  );
}
