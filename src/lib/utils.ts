import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TRANSACTION_FEE = 1;

export const SHIPPING_FEE = 0;

export const INFINITE_SCROLL_PAGINATION_RESULTS = 25;

export const INFINITE_SCROLL_REVIEWS_RESULT = 2;

export const formatPrice = (
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BDT";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) => {
  const { currency = "USD", notation = "compact" } = options;

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

export const getCurrentPrice = ({
  price,
  discount,
}: {
  price: number;
  discount: number;
}) => {
  const discountRate = discount / 100;

  const discountAmount = discountRate * price;

  const currentPrice = price - discountAmount;

  return currentPrice;
};

export const storeCategories = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "reviewing",
    label: "Reviewing",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "declined",
    label: "Declined",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

export const getStoreStatusValue = (status: string) => {
  let statusValue: storeStatus;

  switch (status) {
    case "pending":
      statusValue = "PENDING";
      break;
    case "reviewing":
      statusValue = "REVIEWING";
      break;
    case "approved":
      statusValue = "APPROVED";
      break;
    case "declined":
      statusValue = "DECLINED";
      break;
    case "closed":
      statusValue = "CLOSED";
      break;
    default:
      statusValue = "PENDING";
      break;
  }

  return statusValue;
};

export const productCategories = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "reviewing",
    label: "Reviewing",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "declined",
    label: "Declined",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

export const getProductStatusValue = (status: string) => {
  let statusValue: ProductStatus;

  switch (status) {
    case "pending":
      statusValue = "PENDING";
      break;
    case "reviewing":
      statusValue = "REVIEWING";
      break;
    case "approved":
      statusValue = "APPROVED";
      break;
    case "declined":
      statusValue = "DECLINED";
      break;
    case "archived":
      statusValue = "ARCHIVED";
      break;
    default:
      statusValue = "PENDING";
      break;
  }

  return statusValue;
};

export const orderCategories = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "readyforshipping",
    label: "Ready For Shipping",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "outfordelivery",
    label: "Out For Delivery",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "returned",
    label: "Returned",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
  {
    value: "failed",
    label: "Failed",
  },
];

export const getOrderStatusValue = (status: string) => {
  let statusValue: OrderStatus;

  switch (status) {
    case "processing":
      statusValue = OrderStatus.PROCESSING;
      break;
    case "confirmed":
      statusValue = OrderStatus.CONFIRMED;
      break;
    case "readyforshipping":
      statusValue = OrderStatus.READYFORSHIPPING;
      break;
    case "shipped":
      statusValue = OrderStatus.SHIPPED;
      break;
    case "outfordelivery":
      statusValue = OrderStatus.OUTFORDELIVERY;
      break;
    case "delivered":
      statusValue = OrderStatus.DELIVERED;
      break;
    case "cancelled":
      statusValue = OrderStatus.CANCELLED;
      break;
    case "returned":
      statusValue = OrderStatus.RETURNED;
      break;
    case "refunded":
      statusValue = OrderStatus.REFUNDED;
      break;
    case "failed":
      statusValue = OrderStatus.FAILED;
      break;
    default:
      statusValue = OrderStatus.PROCESSING;
      break;
  }

  return statusValue;
};

export const getStatusColor = (status: storeStatus) => {
  let color;

  switch (status) {
    case "PENDING":
      color = "text-gray-500";
      break;
    case "REVIEWING":
      color = "text-orange-500";
      break;
    case "APPROVED":
      color = "text-green-500";
      break;
    case "DECLINED":
      color = "text-red-500";
      break;
    case "CLOSED":
      color = "text-gray-600";
      break;
    default:
      color = "text-black";
      break;
  }

  return color;
};

export const getProductColor = (status: ProductStatus) => {
  let color;

  switch (status) {
    case "PENDING":
      color = "text-gray-500";
      break;
    case "REVIEWING":
      color = "text-orange-500";
      break;
    case "APPROVED":
      color = "text-green-500";
      break;
    case "DECLINED":
      color = "text-red-500";
      break;
    case "ARCHIVED":
      color = "text-gray-600";
      break;
    default:
      color = "text-black";
      break;
  }

  return color;
};

export const canCancel = (status: OrderStatus) => {
  let cancel = false;

  switch (status) {
    case "PROCESSING":
      cancel = true;
      break;
    case "CONFIRMED":
      cancel = true;
      break;
    default:
      cancel = false;
      break;
  }

  return cancel;
};

export const getOrderStatusText = (status: OrderStatus) => {
  let text = "";

  switch (status) {
    case OrderStatus.PROCESSING:
      text = "Processing";
      break;
    case OrderStatus.CONFIRMED:
      text = "Confirmed";
      break;
    case OrderStatus.READYFORSHIPPING:
      text = "Ready For Shipping";
      break;
    case OrderStatus.SHIPPED:
      text = "Shipped";
      break;
    case OrderStatus.OUTFORDELIVERY:
      text = "Out For Delivery";
      break;
    case OrderStatus.DELIVERED:
      text = "Delivered";
      break;
    case OrderStatus.CANCELLED:
      text = "Cancelled";
      break;
    case OrderStatus.RETURNED:
      text = "Returned";
      break;
    case OrderStatus.RETURNREQUESTED:
      text = "Return requested";
      break;
    case OrderStatus.RETURNING:
      text = "Returning";
      break;
    case OrderStatus.REFUNDED:
      text = "Refunded";
      break;
    case OrderStatus.FAILED:
      text = "Failed";
      break;
    default:
      text = "Unknown";
      break;
  }

  return text;
};

export const adminCanUpdate = (status: OrderStatus) => {
  let canUpdate = false;

  switch (status) {
    case "READYFORSHIPPING":
      canUpdate = true;
      break;
    case "SHIPPED":
      canUpdate = true;
      break;
    case "OUTFORDELIVERY":
      canUpdate = true;
      break;
    default:
      canUpdate = false;
      break;
  }

  return canUpdate;
};

export const reasonsForReturn = [
  "Wrong Size/Fit",
  "Item Not as Described",
  "Changed Mind",
  "Defective/Damaged",
  "Received Wrong Item",
  "Better Price Found",
  "Gift Return",
  "Quality Not as Expected",
  "Delivery Issues",
  "Ordered the wrong item by mistake",
];

export const generatePriceRanges = ({
  maxPrice,
  step,
}: {
  maxPrice: number;
  step: number;
}) => {
  let ranges = [];

  for (let minPrice = 0; minPrice <= maxPrice; minPrice += step) {
    ranges.push({
      value: [minPrice, minPrice + step],
      label: `Up to ${formatPrice(minPrice + step, {
        currency: "GBP",
      })}`,
    });
  }

  return ranges;
};

export const containBadWords = (text: string) => {
  let hasBadWords: boolean = false;

  const filter = new Filter();

  hasBadWords = filter.isProfane(text.toLowerCase());

  return hasBadWords;
};
