"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, ImagePlus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { generateReactHelpers } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate the React helpers for UploadThing
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type Props = {
  value?: string;
  disabled?: boolean;
  storeId?: string;
  testId?: string;
  onChange: (url: string) => void;
  currentUser?: {
    id: string | undefined;
    name: string | undefined;
  };
};

const BannerUpload = ({
  value,
  disabled,
  storeId,
  onChange,
  testId,
  currentUser,
}: Props) => {
  const [base64, setBase64] = useState(value);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setBase64(res[0].ufsUrl);
        onChange(res[0].ufsUrl);
        setIsUploading(false);
        toast.success("Image uploaded successfully!");
      }
    },
    onUploadError: (error) => {
      toast.error(`Error uploading: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleDrop = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Preview image while uploading
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        setBase64(reader.result as string);
      }
    };

    try {
      await startUpload(files);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false, // Only one file at a time
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: handleDrop,
    onDropRejected: () => {
      toast.error(
        "Could not upload! File might be too large or invalid format."
      );
    },
    disabled: disabled || isUploading,
    accept: {
      "image/*": [],
    },
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBase64("");
    onChange("");
  };

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

      {isUploading && (
        <div className="mt-2">
          <span className="text-violet-400">Uploading...</span>
        </div>
      )}

      {base64 && typeof base64 === "string" && (
        <div className="relative w-40 h-40 mx-auto bg-black rounded-lg overflow-hidden">
          <Image
            className="object-cover rounded-lg"
            src={base64}
            fill
            alt="Banner preview"
          />
          <Trash2
            className="absolute -top-1 -right-1 cursor-pointer text-red-500"
            onClick={clearImage}
          />
        </div>
      )}
    </div>
  );
};

export default BannerUpload;
