"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  storeId: string;
};

const ShareStoreLink = ({ storeId }: Props) => {
  const [copied, setCopied] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/stores/${storeId}`;

  const onCopy = () => {
    navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center gap-1">
          <ExternalLink className="w-4 h-4" />

          <span>Share</span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-violet-500 animate-pulse" />

            <p className="text-xs font-medium text-violet-500">
              This is the link to your store. feel free to share it with others.
            </p>
          </div>

          <div className="flex items-center">
            <input
              className="flex-1 bg-muted h-8 px-2 text-xs border rounded-l-md truncate"
              value={url}
              disabled
            />

            <Button
              onClick={onCopy}
              disabled={copied}
              className="h-8 rounded-l-none"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareStoreLink;
