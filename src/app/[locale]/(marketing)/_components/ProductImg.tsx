"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Props = {
  images: string[];
};

const ProductImg = ({ images }: Props) => {
  return (
    <Carousel
      swipeable={true}
      showThumbs={false}
      infiniteLoop
      showStatus={false}
      renderArrowNext={(clickHandler, hasNext) => {
        return (
          <button
            className={cn(
              "bg-black/75 absolute z-20 top-1/2 -translate-y-0 right-4 hidden md:flex items-center justify-center p-2 text-white rounded-full",
              !hasNext && "opacity-0"
            )}
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();

              clickHandler();
            }}
          >
            <ArrowRight />
          </button>
        );
      }}
      renderArrowPrev={(clickHandler, hasPrev) => {
        return (
          <button
            className={cn(
              "bg-black/75 absolute z-20 top-1/2 -translate-y-0 left-4 hidden md:flex items-center justify-center p-2 text-white rounded-full",
              !hasPrev && "opacity-0"
            )}
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();

              clickHandler();
            }}
          >
            <ArrowLeft />
          </button>
        );
      }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="relative w-full aspect-video md:aspect-square overflow-hidden"
        >
          <Image
            className="object-cover"
            loading="lazy"
            fill
            src={img}
            alt={`product-item-${i}`}
          />
        </div>
      ))}
    </Carousel>
  );
};

export default ProductImg;
