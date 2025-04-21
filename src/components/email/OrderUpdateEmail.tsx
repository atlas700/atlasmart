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
  username: string;
  address: string;
  orderId: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: string;
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
  username,
  totalAmount,
  address,
  orderId,
  orderDate,
  orderStatus,
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>LocalMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 LocalMart</Text>

          <Text style={paragraph}>Dear {username},</Text>

          <Text style={paragraph}>
            We&apos;re reaching out to inform you of a change to your recent
            order with us. We strive to keep you updated every step of the way,
            ensuring a transparent shopping experience.
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Order No: #{orderId}</Text>

            <Text style={paragraph}>Order Date: {orderDate}</Text>

            <Text style={paragraph}>Total Amount: {totalAmount}</Text>

            <Text style={paragraph}>Shipping Address: {address}</Text>
          </Section>

          <Text style={paragraph}>
            Your order status has been updated to: {orderStatus}
          </Text>

          <Text style={paragraph}>
            Thank you for choosing 🛍 LocalMart. We hope you enjoy your purchase!
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

export const OrderUpdateEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
