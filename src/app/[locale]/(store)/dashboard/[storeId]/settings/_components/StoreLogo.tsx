"use client";

import { UploadButton } from "@/lib/uploadthing";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  value?: string | undefined;
  disabled?: boolean;
  storeId: string;
  testId?: string;
  onChange: (base64: string | undefined) => void;
};

const StoreLogo = ({ value, disabled, storeId, testId, onChange }: Props) => {
  // const { user } = useCurrentUser();

  const [base64, setBase64] = useState(value);

  const clearImage = () => {
    setBase64("");

    onChange(undefined);
  };

  useEffect(() => {
    setBase64(value);
  }, [value]);

  return (
    <div
      data-cy={`${testId}-parent`}
      data-testid={`${testId}-parent`}
      className="w-full max-w-sm p-4 text-center rounded-md cursor-pointer border-2 border-dotted border-gray-200"
    >
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          if (!res) return;
          if (!storeId) return;

          setBase64(res[0]?.ufsUrl);

          onChange(res[0]?.ufsUrl ?? undefined);
        }}
        onUploadError={() => {
          toast.error("Could not upload! Try again later.");

          return;
        }}
        onUploadProgress={() => {
          disabled = true;
        }}
      />

      {base64 && typeof base64 === "string" && (
        <div className="relative w-16 h-16 mx-auto bg-black rounded-full">
          <Image
            className="object-cover rounded-full"
            src={base64}
            fill
            alt=""
            sizes="100%"
          />

          <Trash2
            className="absolute -top-1 -right-0 cursor-ponter text-red-500"
            onClick={clearImage}
          />
        </div>
      )}
    </div>
  );
};

export default StoreLogo;
