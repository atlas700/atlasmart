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
  orderId: string;
  orderDate: string;
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
  orderId,
  orderDate,
  totalAmount,
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
            We have received your request to cancel the following order, and the
            cancellation has been successfully processed:
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Order No: #{orderId}</Text>

            <Text style={paragraph}>Order Date: {orderDate}</Text>

            <Text style={paragraph}>Total Refund: {totalAmount}</Text>
          </Section>

          <Text style={paragraph}>
            Please allow 3 business days for the refund to be credited to your
            original payment method.
          </Text>

          <Text style={paragraph}>
            We hope to have the opportunity to serve you again in the future.
            Thank you for choosing 🛍 LocalMart.
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

export const CancelOrderEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
