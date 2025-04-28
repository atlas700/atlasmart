"use server";

export const getCartItems = async () => {
  try {
    //Check if there is a current user
    const { user } = await currentUser();

    if (!user || !user.id) {
      return null;
    }

    const { role } = await currentRole();

    if (role !== "USER") {
      return null;
    }

    const cart = await prismadb.cart.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            productItem: true,
            availableItem: {
              include: {
                size: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return cart;
  } catch (err) {
    console.log("[CART_ITEM_GET]", err);

    return null;
  }
};
