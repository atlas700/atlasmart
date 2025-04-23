"use client";

import { getCurrentUser } from "@/services/clerk";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type Props = {
  value?: string | string[];
  disabled?: boolean;
  forProduct?: boolean;
  storeId?: string;
  testId?: string;
  userTestId?: string;
  onChange: (base64: string | string[]) => void;
  currentUser: Awaited<ReturnType<typeof getCurrentUser> | null>;
};

const ImageUpload = ({
  value,
  disabled,
  forProduct,
  storeId,
  testId,
  userTestId,
  onChange,
  currentUser,
}: Props) => {
  const user = currentUser?.user;

  const [base64, setBase64] = useState(value);

  const maxFiles = forProduct ? 6 : 1;

  const isDisabled =
    disabled || (Array.isArray(base64) && base64.length >= maxFiles);

  const clearImage = () => {
    setBase64("");

    onChange("");
  };

  const removeImage = (index: number) => {
    if (!Array.isArray(base64)) return;

    const newBase64 = [...base64];

    newBase64.splice(index, 1);

    setBase64(newBase64);

    onChange(newBase64);
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
      });

      onChange(imgUrl || "");
    };
  };

  const handleProductDrop = async (files: any) => {
    if (!user || !storeId) return;

    const imgUrls = await readAllFiles(files).then(async (result) => {
      const urls = await uploadProductImages({
        selectedFiles: result,
        userId: user?.id,
        storeId,
      });

      return urls;
    });

    const updatedBase64 = Array.isArray(base64)
      ? imgUrls
        ? [...base64, ...imgUrls]
        : [...base64]
      : imgUrls;

    setBase64(updatedBase64);

    onChange(updatedBase64 || []);
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: forProduct,
    maxFiles,
    maxSize: 2 * 1024 * 1024,
    onDrop: forProduct ? handleProductDrop : handleDrop,
    onDropRejected: () => {
      toast.error("Could not upload! Try again later.");

      return;
    },
    disabled: forProduct ? isDisabled : disabled,
    accept: {
      "image/*": [],
    },
  });

  useEffect(() => {
    setBase64(value);
  }, [value]);

  return (
    <>
      {forProduct ? (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            data-cy={`${testId}-parent`}
            className="w-full max-w-[300px] p-3 text-center rounded-md cursor-pointer border-2 border-dotted border-gray-200"
          >
            <input {...getInputProps()} data-cy={testId} />

            <div className="flex flex-col">
              <ImagePlus className="w-7 h-7 mb-4 mx-auto text-violet-400" />

              <span className="text-violet-400 text-sm font-medium">
                Choose files or drag and drop
              </span>

              <span className="text-xs">Product Items Images (2MB Each)</span>
            </div>
          </div>

          {Array.isArray(base64) && base64?.length > 0 && (
            <div className="border p-2 rounded-lg w-[300px]">
              <div className="w-full grid gap-2">
                {base64.map((url, i) => (
                  <div className="flex gap-2" key={i}>
                    <div className="relative w-full h-20 rounded-lg border">
                      <Image
                        className="object-cover"
                        src={url}
                        fill
                        alt={`upload-images-${i}`}
                      />
                    </div>

                    <Trash2
                      className="w-6 h-6 cursor-pointer text-red-500"
                      onClick={() => removeImage(i)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          data-cy={`${userTestId}-parent`}
          className="w-full max-w-[300px] mx-auto p-4 text-center rounded-md cursor-pointer border-2 border-dotted border-gray-200"
        >
          <input {...getInputProps()} data-cy={userTestId} />

          {!base64 && (
            <div className="flex flex-col">
              <ImagePlus className="w-10 h-10 mb-5 mx-auto text-violet-400" />

              <span className="text-violet-400 font-medium">
                Choose files or drag and drop
              </span>

              <span className="text-sm">Profile Image (2MB)</span>
            </div>
          )}

          {base64 && typeof base64 === "string" && (
            <div className="relative w-16 h-16 mx-auto bg-black rounded-full">
              <Image
                className="object-cover rounded-full"
                src={base64}
                fill
                alt="user-upload-image"
              />

              <Trash2
                className="absolute -top-1 -right-0 cursor-ponter text-red-500"
                onClick={clearImage}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageUpload;
