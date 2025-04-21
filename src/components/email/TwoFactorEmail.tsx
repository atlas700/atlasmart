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
  code: string;
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

export const EmailTemplate = ({ code }: EmailTemplateProps) => {
  return (
    <Html>
      <Head />

      <Preview>LocalMart</Preview>

      <Body style={main}>
        <Container style={container}>
          <Text style={title}>🛍 LocalMart</Text>

          <Text style={paragraph}>Hi there,</Text>

          <Text style={paragraph}>Your 2FA code: {code}</Text>

          <Text style={paragraph}>
            Best,
            <br />
            The LocalMart team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const TwoFAEmailHtml = (props: EmailTemplateProps) => {
  return render(<EmailTemplate {...props} />, { pretty: true });
};
