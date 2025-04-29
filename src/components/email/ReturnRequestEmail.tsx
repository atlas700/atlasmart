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
  username,
  orderId,
  orderDate,
  items,
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
            We have received your request to return the following item(s) from
            your order #{orderId}. We understand that sometimes things
            don&apos;t work out, and we&apos;re here to help make the return
            process as smooth as possible.
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Order No: #{orderId}</Text>

            <Text style={paragraph}>Order Date: {orderDate}</Text>

            <Text style={paragraph}>Items: {items}</Text>
          </Section>

          <Text style={paragraph}>
            Please allow 3 business days for the refund to be credited to your
            original payment method if request is approved.
          </Text>

          <Text style={paragraph}>
            Thank you for your attention to this matter. We hope to resolve it
            to your satisfaction as quickly as possible.
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

export const ReturnRequestEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
