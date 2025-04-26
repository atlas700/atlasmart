import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { RouteType } from "../../../types";
import Routes from "./Routes";

type Props = {
  routes: RouteType[];
};

const MobileRoutes = ({ routes }: Props) => {
  const [open, setOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger onClick={() => setOpen(true)} asChild>
        <Button className="md:hidden" variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent className="max-w-[250px] pt-16" side="left">
        <Routes
          routes={routes}
          className="flex-col items-start gap-6"
          closeModal={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MobileRoutes;
