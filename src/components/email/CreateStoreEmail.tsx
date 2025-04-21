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
  description: string;
  storeName: string;
  storeEmail: string;
  ownerName: string;
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
  description,
  storeEmail,
  ownerName,
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>LocalMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 LocalMart</Text>

          <Text style={paragraph}>Dear {ownerName},</Text>

          <Text style={paragraph}>
            Congratulations! Your store has been successfully created on
            LocalMart. You are now ready to start selling your products to
            customers worldwide.
          </Text>

          <Section style={btnContainer}>
            <Text style={paragraph}>Store Name: {storeName}</Text>

            <Text style={paragraph}>Store Description: {description}</Text>

            <Text style={paragraph}>Email Address: {storeEmail}</Text>
          </Section>

          <Text style={paragraph}>
            Your store is now live and accessible to visitors on our platform.
            You can begin adding and managing products through your seller
            dashboard.
          </Text>

          <Text style={paragraph}>
            If you have any questions or need further assistance, please feel
            free to reach out to our support team at david.u.emioma@gmail.com.
          </Text>

          <Text style={paragraph}>
            Thank you for choosing [Your E-commerce Platform Name]. We wish you
            great success with your new store!
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

export const CreateStoreEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
