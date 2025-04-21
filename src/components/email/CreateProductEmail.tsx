import * as React from "react";
import { formatPrice } from "@/lib/utils";
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
  storeName: string;
  productName: string;
  categoryName: string;
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
  storeName,
  productName,
  categoryName,
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
            We are writing to confirm that your new product has been
            successfully created on your LocalMart store {storeName}. Below are
            the details of the product you have added:
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Product Name: {productName}</Text>

            <Text style={paragraph}>Category: {categoryName}</Text>
          </Section>

          <Text style={paragraph}>
            Thank you for adding this product to our platform. It is now live
            and visible to our users.
          </Text>

          <Text style={paragraph}>
            If you have any questions or need further assistance, please feel
            free to reach out to our support team at david.u.emioma@gmail.com.
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

export const CreateProductEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
