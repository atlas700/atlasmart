"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import { Trash2, ImagePlus } from "lucide-react";
import { uploadToStorage } from "@/lib/functions";
import useCurrentUser from "@/hooks/use-current-user";

type Props = {
  value?: string;
  disabled?: boolean;
  storeId?: string;
  testId?: string;
  onChange: (base64: string) => void;
};

const BannerUpload = ({
  value,
  disabled,
  storeId,
  onChange,
  testId,
}: Props) => {
  const { user } = useCurrentUser();

  const [base64, setBase64] = useState(value);

  const isDisabled = disabled || (base64 !== undefined && base64?.length > 0);

  const clearImage = () => {
    setBase64("");

    onChange("");
  };

  const handleDrop = (files: any) => {
    if (!user) return;

    const file = files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async (e: any) => {
      setBase64(e.target.result);

      const imgUrl = await uploadToStorage({
        file: e.target.result,
        userId: user?.id,
        pathname: `store/${storeId}/banners/${uuidv4()}`,
      });

      onChange(imgUrl || "");
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    onDrop: handleDrop,
    onDropRejected: () => {
      toast.error("Could not upload! Try again later.");

      return;
    },
    disabled: isDisabled,
    accept: {
      "image/*": [],
    },
  });

  useEffect(() => {
    setBase64(value);
  }, [value]);

  return (
    <div
      {...getRootProps()}
      data-testid="banner-upload"
      className="w-full max-w-[300px] mx-auto p-4 text-center rounded-md cursor-pointer border-2 border-dotted border-gray-200"
    >
      <input {...getInputProps()} data-cy={testId} />

      {!base64 && (
        <div className="flex flex-col">
          <ImagePlus className="w-10 h-10 mb-5 mx-auto text-violet-400" />

          <span className="text-violet-400 font-medium">
            Choose files or drag and drop
          </span>

          <span className="text-sm">Banner Image (2MB)</span>
        </div>
      )}

      {base64 && typeof base64 === "string" && (
        <div className="relative w-40 h-40 mx-auto bg-black rounded-lg">
          <Image
            className="object-cover rounded-full"
            src={base64}
            fill
            alt=""
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

export default BannerUpload;
