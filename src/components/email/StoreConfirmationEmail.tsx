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
  customerName: string;
  orderDate: string;
  items: string;
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
  customerName,
  orderDate,
  items,
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
            We&apos;re excited to inform you that a customer has placed an order
            that includes products from your store. Below are the details of the
            items ordered:
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Order Date: {orderDate}</Text>

            <Text style={paragraph}>Customer Name: {customerName}</Text>

            <Text style={paragraph}>Items: {items}</Text>
          </Section>

          <Text style={paragraph}>
            Please proceed with the packing and shipping of the above items as
            per the agreed terms. Ensure that the order is dispatched by
            tomorrow to meet the estimated delivery date.
          </Text>

          <Text style={paragraph}>
            Thank you for your prompt attention to this order. We appreciate
            your partnership and commitment to customer satisfaction.
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

export const StoreConfirmationEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
