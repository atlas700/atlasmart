import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
  render,
} from "@react-email/components";

type EmailTemplateProps = {
  username: string;
  storeName: string;
  productName: string;
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

export const EmailTemplate = ({
  username,
  storeName,
  productName,
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
            We are writing to confirm that your new product {productName} has
            been successfully deleted from your LocalMart store {storeName}.
          </Text>

          <Text style={paragraph}>
            Unfortunately, this product is no longer be visible to our users.
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

export const DeletedProductEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
