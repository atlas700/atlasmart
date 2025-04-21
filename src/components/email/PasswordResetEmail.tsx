import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  render,
} from "@react-email/components";

type EmailTemplateProps = {
  href: string;
  buttonText: string;
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

const logo = {
  margin: "0 auto",
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
};

const button = {
  padding: "12px 12px",
  backgroundColor: "#2563eb",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};

export const EmailTemplate = ({ href, buttonText }: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>LocalMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 LocalMart</Text>

          <Text style={paragraph}>Hi there,</Text>

          <Section style={btnContainer}>
            <Button style={button} href={href}>
              {buttonText}
            </Button>
          </Section>

          <Text style={paragraph}>
            Best,
            <br />
            The LocalMart team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you did not request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const PasswordResetEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
