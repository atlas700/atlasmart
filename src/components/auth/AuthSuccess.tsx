import React from "react";
import { CheckCircleIcon } from "lucide-react";

type Props = {
  message?: string;
  testId?: string;
};

const AuthSuccess = ({ message, testId }: Props) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className="bg-emerald-500/15 flex items-center gap-2 p-3 text-sm text-emerald-500 rounded-md"
      data-cy={testId}
    >
      <CheckCircleIcon className="h-4 w-4" />

      <p>{message}</p>
    </div>
  );
};

export default AuthSuccess;
