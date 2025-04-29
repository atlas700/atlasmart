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

      <Preview>AtlasMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 AtlasMart</Text>

          <Text style={paragraph}>Dear {username},</Text>

          <Text style={paragraph}>
            We are writing to confirm that your new product has been
            successfully updated on your AtlasMart store {storeName}.
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Product Name: {productName}</Text>

            <Text style={paragraph}>Category: {categoryName}</Text>
          </Section>

          <Text style={paragraph}>
            The changes you made are now reflected on our platform. Your product
            is updated and visible to our users with the new information.
          </Text>

          <Text style={paragraph}>
            If you have any questions or need further assistance, please feel
            free to reach out to our support team at david.u.emioma@gmail.com.
          </Text>

          <Text style={paragraph}>
            Thank you for keeping your product information up-to-date.
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

export const UpdateProductEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
