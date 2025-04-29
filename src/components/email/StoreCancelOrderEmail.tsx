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
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>AtlasMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 AtlasMart</Text>

          <Text style={paragraph}>Dear {storeName},</Text>

          <Text style={paragraph}>
            We regret to inform you that the following order, including items
            from your store, has been canceled by the customer:
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Order No: #{orderId}</Text>

            <Text style={paragraph}>Order Date: {orderDate}</Text>

            <Text style={paragraph}>Item: {item}</Text>
          </Section>

          <Text style={paragraph}>
            Please halt any processing or shipping operations related to this
            order. If the order has already been dispatched, please contact us
            immediately at AtlasMart@email.com for further instructions.
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
            The AtlasMart team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const StoreCancelOrderEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
