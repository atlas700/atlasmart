import React from "react";
import Link from "next/link";
import Container from "./Container";

const Footer = () => {
  return (
    <footer className="bg-white flex-grow-0 border-t border-gray-200">
      <Container>
        <div className="flex flex-col md:flex-row items-center md:justify-between py-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} David Emioma, All Rights Reserved
          </p>

          <div className="flex items-center justify-center mt-4 md:mt-0">
            <div className="flex items-center space-x-8">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Terms
              </Link>

              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Privacy Policy
              </Link>

              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
