import { CancelOrderEmailHtml } from "@/components/email/CancelOrderEmail";
import { ConfirmationOrderEmailHtml } from "@/components/email/ConfirmationOrderEmail";
import { CreateProductEmailHtml } from "@/components/email/CreateProductEmail";
import { CreateStoreEmailHtml } from "@/components/email/CreateStoreEmail";
import { DeletedProductEmailHtml } from "@/components/email/deletedProductEmail";
import { OrderUpdateEmailHtml } from "@/components/email/OrderUpdateEmail";
import { PasswordResetEmailHtml } from "@/components/email/PasswordResetEmail";
import { ReturnOrderEmailHtml } from "@/components/email/ReturnOrderEmail";
import { ReturnRequestEmailHtml } from "@/components/email/ReturnRequestEmail";
import { StoreCancelOrderEmailHtml } from "@/components/email/StoreCancelOrderEmail";
import { StoreConfirmationEmailHtml } from "@/components/email/StoreConfirmationEmail";
import { StoreReturnOrderEmailHtml } from "@/components/email/StoreReturnOrderEmail";
import { StoreVerificationEmailHtml } from "@/components/email/StoreVerificationEmail";
import { TwoFAEmailHtml } from "@/components/email/TwoFactorEmail";
import { UpdateProductEmailHtml } from "@/components/email/UpdateProductEmail";
import { VerificationEmailHtml } from "@/components/email/VerificationEmail";
import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL;

const from = process.env.EMAIL_USERNAME;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Confirm your email",
      html: await await VerificationEmailHtml({
        href: confirmLink,
        buttonText: "Verify Email",
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendTwoFactorTokenEmail = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "2FA Code",
      html: await TwoFAEmailHtml({
        code: token,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendPasswordResetEmail = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Reset your password",
      html: await PasswordResetEmailHtml({
        href: resetLink,
        buttonText: "Reset Password",
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendStoreVerificationTokenEmail = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Store Verification Code",
      html: await StoreVerificationEmailHtml({
        code: token,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendConfirmationOrderEmail = async ({
  email,
  username,
  address,
  totalAmount,
}: {
  email: string;
  username: string;
  address: string;
  totalAmount: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Your Order Confirmation",
      html: await ConfirmationOrderEmailHtml({
        username,
        address,
        totalAmount,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendStoreConfirmationEmail = async ({
  email,
  storeName,
  customerName,
  orderDate,
  items,
}: {
  email: string;
  storeName: string;
  customerName: string;
  orderDate: string;
  items: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "New Order Alert",
      html: await StoreConfirmationEmailHtml({
        storeName,
        customerName,
        orderDate,
        items,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendCancelOrderEmail = async ({
  email,
  username,
  orderId,
  orderDate,
  totalAmount,
}: {
  email: string;
  username: string;
  orderId: string;
  orderDate: string;
  totalAmount: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Confirmation of Your Order Cancellation - [#${orderId}]`,
      html: await CancelOrderEmailHtml({
        username,
        orderId,
        orderDate,
        totalAmount,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendStoreCancelOrderEmail = async ({
  email,
  storeName,
  orderId,
  orderDate,
  item,
}: {
  email: string;
  storeName: string;
  item: string;
  orderId: string;
  orderDate: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Notice of Order Cancellation - Order [#${orderId}]`,
      html: await StoreCancelOrderEmailHtml({
        storeName,
        orderId,
        orderDate,
        item,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendOrderStatusUpdateEmail = async ({
  email,
  username,
  orderId,
  orderDate,
  orderStatus,
  address,
  totalAmount,
}: {
  email: string;
  username: string;
  address: string;
  orderId: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Your Order  - Order [#${orderId}] is ${orderStatus}!`,
      html: await OrderUpdateEmailHtml({
        username,
        orderId,
        orderDate,
        orderStatus,
        address,
        totalAmount,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendReturnRequestEmail = async ({
  email,
  username,
  orderId,
  orderDate,
  items,
}: {
  email: string;
  username: string;
  orderId: string;
  orderDate: string;
  items: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Your Return Request for Order - [#${orderId}] - Received`,
      html: await ReturnRequestEmailHtml({
        username,
        orderId,
        orderDate,
        items,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendReturnOrderEmail = async ({
  email,
  username,
  orderId,
  orderDate,
  totalAmount,
}: {
  email: string;
  username: string;
  orderId: string;
  orderDate: string;
  totalAmount: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Confirmation of Your Order return - [#${orderId}]`,
      html: await ReturnOrderEmailHtml({
        username,
        orderId,
        orderDate,
        totalAmount,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendStoreReturnOrderEmail = async ({
  email,
  storeName,
  orderId,
  orderDate,
  item,
  reason,
}: {
  email: string;
  storeName: string;
  item: string;
  orderId: string;
  orderDate: string;
  reason: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Notification of Item Return - Order [#${orderId}]`,
      html: await StoreReturnOrderEmailHtml({
        storeName,
        orderId,
        orderDate,
        item,
        reason,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendCreatedStoreEmail = async ({
  email,
  storeName,
  description,
  storeEmail,
  ownerName,
}: {
  email: string;
  description: string;
  storeName: string;
  storeEmail: string;
  ownerName: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Store Creation Confirmation",
      html: await CreateStoreEmailHtml({
        storeName,
        description,
        storeEmail,
        ownerName,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendCreatedProductEmail = async ({
  email,
  storeName,
  username,
  productName,
  categoryName,
}: {
  email: string;
  username: string;
  storeName: string;
  productName: string;
  categoryName: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Product Creation Confirmation",
      html: await CreateProductEmailHtml({
        storeName,
        username,
        productName,
        categoryName,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendUpdatedProductEmail = async ({
  email,
  storeName,
  username,
  productName,
  categoryName,
}: {
  email: string;
  username: string;
  storeName: string;
  productName: string;
  categoryName: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Product Update Confirmation",
      html: await UpdateProductEmailHtml({
        storeName,
        username,
        productName,
        categoryName,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendDeletedProductEmail = async ({
  email,
  storeName,
  username,
  productName,
}: {
  email: string;
  username: string;
  storeName: string;
  productName: string;
}) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Product Deletion Notification",
      html: await DeletedProductEmailHtml({
        storeName,
        username,
        productName,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};
