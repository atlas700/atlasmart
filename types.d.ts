import {
  AvailableItemTable,
  BannerTable,
  CartItemTable,
  CartTable,
  CategoryTable,
  ColorTable,
  OrderItemTable,
  OrderTable,
  SizeTable,
  UserTable,
  StoreTable,
  ReviewTable,
  ProductTable,
  ReturnItemTable,
  ProductItemTable,
  ReturnRequestTable,
  StoreVerificationTokenTable,
} from "@/drizzle/schema";

export type AvailableType = AvailableItemTable & { size: SizeTable };

export type ProductItemType = ProductItemTable & {
  availableItems: AvailableType[];
};

export type ProductType = ProductTable & {
  category: CategoryTable;
  productItems: ProductItemType[];
};

export type ProductDetailType = ProductTable & {
  category: CategoryTable;
  store: {
    name: string;
    logo: string | null;
  };
  productItems: ProductItemType[];
  reviews: {
    value: number;
  }[];
};

export type HomeProductType = ProductTable & {
  category: CategoryTable;
  productItems: ProductItemType[];
  reviews: {
    value: number;
  }[];
};

export type RouteType = {
  href: string;
  label: string;
  active: boolean;
};

export type CartItemType = CartItemTable & {
  product: (ProductTable & { category: CategoryTable }) | null;
  productItem: ProductItemTable | null;
  availableItem: AvailableType | null;
};

export type CartType = CartTable & {
  cartTableItems: CartTableItemType[];
};

export type ReviewType = ReviewTable & {
  user: {
    name: string | null;
    image: string | null;
  };
};

export type OrderItemCol = OrderItemTable & {
  product: {
    name: string;
  };
  productItem: {
    images: string[];
  };
  availableItem: {
    currentPrice: number;
    size: SizeTable;
  };
};

export type OrderCol = OrderTable & {
  orderItems: OrderItemCol[];
};

export type StoreOrderCol = OrderItemTable & {
  order: {
    status: OrderStatusTable;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  product: {
    name: string;
  };
  productItem: {
    images: string[];
  };
  availableItem: {
    currentPrice: number;
    size: SizeTable;
  };
};

export type AdminOrderStatusChange =
  | "READYFORSHIPPING"
  | "SHIPPED"
  | "OUTFORDELIVERY"
  | "DELIVERED";

export type ReturnItemProps = ReturnItemTable & {
  orderItem: {
    quantity: number;
    product: {
      name: string;
      category: {
        name: string;
      };
    };
    productItem: {
      images: string[];
    };
    availableItem: {
      currentPrice: number;
    };
  };
};

export type ReturnRequestProps = ReturnRequestTable & {
  returnItems: ReturnItemProps[];
};

export type SearchFilters = {
  category: string;
  price: {
    isCustom: boolean;
    range: number[];
  };
  discount: number[];
};

export type RecommendedType = Partial<ProductTable> & {
  category: Partial<CategoryTable>;
};
