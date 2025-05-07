"use client";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserRole, userRoles } from "@/drizzle/schema";
import { getCartItems } from "@/features/cart/db/cart";
import { SHIPPING_FEE, TRANSACTION_FEE, formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Empty from "../Empty";
import Spinner from "../Spinner";
import { buttonVariants } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import CartItem from "./CartItem";

const Cart = ({
  currentUser,
}: {
  currentUser: { id: string; role: UserRole };
}) => {
  const pathname = usePathname();

  const user = currentUser;

  const [isMounted, setIsMounted] = useState(false);

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-cart-item"],
    queryFn: async () => {
      const data = await getCartItems();

      return data;
    },
  });

  const emptyCart =
    !isLoading &&
    !isError &&
    // @ts-ignore
    (!cart || !cart.cartItems || cart!.cartItems!.length === 0);

  const cartTotal =
    // @ts-ignore
    (cart!.cartItems!.reduce(
      (total: any, item: any) =>
        total + ((item.availableItem?.currentPrice || 0) * item?.quantity || 0),
      0
    ) || 0) +
    TRANSACTION_FEE +
    SHIPPING_FEE;

  const showCart = user?.role === userRoles[0] && pathname !== "/checkout";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !showCart) return null;

  return (
    <Sheet>
      <SheetTrigger
        className="group flex items-center gap-1 px-2"
        data-cy="cart-trigger"
        data-testid="cart-trigger"
      >
        <ShoppingCartIcon
          className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />

        <span
          className="text-sm font-medium text-gray-700 group-hover:text-gray-800"
          data-cy="cart-number"
        >
          {/* @ts-ignore */}
          {cart?.cartItems?.length || 0}
        </span>
      </SheetTrigger>

      <SheetContent
        className="w-full sm:max-w-lg flex flex-col"
        data-cy="cart-content"
        data-testid="cart-content"
      >
        <SheetHeader>
          <SheetTitle className="py-2.5">
            {/* @ts-ignore */}
            Cart ({cart?.cartItems?.length || 0})
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="h-full">
            <Spinner />
          </div>
        )}

        {isError && <Empty message="Could not get item! Try again later" />}

        {emptyCart && (
          <div data-cy="empty-cart">
            <Empty message="Looks like you haven't added anything to your cart yet. Ready to start shopping? Browse our collection to find something you'll love!" />
          </div>
        )}
        {/* @ts-ignore */}
        {!isLoading && !isError && cart?.cartItems && (
          <>
            {/* @ts-ignore */}
            {cart?.cartItems?.length > 0 && (
              <ScrollArea>
                <div className="space-y-5">
                  {/* @ts-ignore */}
                  {cart?.cartItems?.map((item, i) => (
                    <CartItem key={item.id} cartItem={item} index={i} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}

        {!isLoading &&
          !isError &&
          // @ts-ignore
          cart?.cartItems &&
          // @ts-ignore
          cart.cartItems.length > 0 && (
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="flex-1">Shipping</span>

                <span className="font-semibold">
                  {formatPrice(SHIPPING_FEE, { currency: "USD" })}
                </span>
              </div>

              <div className="flex">
                <span className="flex-1">Transaction Fee</span>

                <span className="font-semibold">
                  {formatPrice(TRANSACTION_FEE, { currency: "USD" })}
                </span>
              </div>

              <div className="flex">
                <span className="flex-1">Total</span>

                <span className="font-semibold">
                  {formatPrice(cartTotal, { currency: "USD" })}
                </span>
              </div>
            </div>
          )}

        {!isLoading &&
          !isError &&
          // @ts-ignore
          cart?.cartItems &&
          // @ts-ignore
          cart.cartItems.length > 0 && (
            <SheetFooter>
              <SheetTrigger asChild>
                <Link
                  href="/checkout"
                  className={buttonVariants({
                    className: "w-full bg-violet-500",
                  })}
                  data-cy="checkout-btn"
                >
                  Continue to Checkout
                </Link>
              </SheetTrigger>
            </SheetFooter>
          )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
