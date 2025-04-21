import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  render,
} from "@react-email/components";

type EmailTemplateProps = {
  storeName: string;
  item: string;
  orderId: string;
  orderDate: string;
  reason: string;
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const title = {
  fontSize: "20px",
  lineHeight: "26px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "5px 5px",
};

export const EmailTemplate = ({
  storeName,
  orderId,
  orderDate,
  item,
  reason,
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>LocalMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 LocalMart</Text>

          <Text style={paragraph}>Dear {storeName},</Text>

          <Text style={paragraph}>
            We regret to inform you that the following order, including items
            from your store, has been returned by the customer:
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Order No: #{orderId}</Text>

            <Text style={paragraph}>Order Date: {orderDate}</Text>

            <Text style={paragraph}>Item: {item}</Text>

            <Text style={paragraph}>Reason: {reason}</Text>
          </Section>

          <Text style={paragraph}>
            Please review this return notification and prepare to receive the
            returned item(s) at your facility and Ensure that your inventory is
            updated accordingly once the item(s) are received. If there are any
            restocking fees or return processing actions to be taken, please
            proceed as per our agreed terms.
          </Text>

          <Text style={paragraph}>
            We apologize for any inconvenience this may cause and appreciate
            your prompt attention to this matter. Our team is committed to
            ensuring a smooth resolution for both our customers and our valued
            partners like you.
          </Text>

          <Text style={paragraph}>
            Thank you for your understanding and cooperation.
          </Text>

          <Text style={paragraph}>
            Best regards,
            <br />
            The LocalMart team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const StoreReturnOrderEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
