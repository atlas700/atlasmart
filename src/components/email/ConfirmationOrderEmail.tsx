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
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>AtlasMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 AtlasMart</Text>

          <Text style={paragraph}>Dear {username},</Text>

          <Text style={paragraph}>
            Thank you for shopping with us! We&apos;re excited to let you know
            that we&apos;ve received your order, and it&apos;s now being
            processed.
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Total Amount: {totalAmount}</Text>

            <Text style={paragraph}>Shipping Address: {address}</Text>
          </Section>

          <Text style={paragraph}>
            Your order will be shipped to the address above in 3 days.
            You&apos;ll receive another email with a tracking number once your
            order is on its way.
          </Text>

          <Text style={paragraph}>
            Thank you for choosing 🛍 AtlasMart. We hope you enjoy your
            purchase!
          </Text>

          <Text style={paragraph}>
            Best regards,
            <br />
            The AtlasMart team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const ConfirmationOrderEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
