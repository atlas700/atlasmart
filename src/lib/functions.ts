import { v4 as uuidv4 } from "uuid";

const readFileContents = async (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e: any) => {
      resolve(e.target.result);
    };

    reader.onerror = reject;
  });
};

export const readAllFiles = async (files: any) => {
  const results = await Promise.all(
    files.map(async (file: any) => {
      const fileContents = await readFileContents(file);

      return {
        name: file.name,
        base64: fileContents,
      };
    })
  );

  return results;
};

export const generateTrackingId = (length = 10) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const getRefundFailedReason = (failure_reason: string | undefined) => {
  let reason = "";

  switch (failure_reason) {
    case "charge_for_pending_refund_disputed":
      reason = "You have already requested to cancel order.";
      break;
    case "declined":
      reason = "You request to cancel order has been declined.";
      break;
    case "expired_or_canceled_card":
      reason = "Your payment card has either expired or is cancelled.";
      break;
    case "insufficient_funds":
      reason = "Refund has failed due to insufficient funds.";
      break;
    case "lost_or_stolen_card":
      reason = "Refund has failed due to loss or theft of the payment card.";
      break;
    case "merchant_request":
      reason = "Unable to cancel your order.";
      break;
    case "unknown":
      reason = "Refund has failed due to an unknown reason.";
      break;
    default:
      reason = "Something went wrong.";
      break;
  }

  return reason;
};
