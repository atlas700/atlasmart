import React from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

type Props = {
  message?: string;
  testId?: string;
};

const AuthError = ({ message, testId }: Props) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className="bg-destructive/15 flex items-center gap-2 p-3 text-sm text-destructive rounded-md"
      data-cy={testId}
    >
      <ExclamationTriangleIcon className="h-4 w-4" />

      <p>{message}</p>
    </div>
  );
};

export default AuthError;
