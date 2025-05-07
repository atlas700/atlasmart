"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Props = {
  images: string[];
};

const ImageSlider = ({ images }: Props) => {
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className="lg:hidden">
        <Carousel
          swipeable={true}
          showThumbs={false}
          infiniteLoop
          showStatus={false}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative w-full h-40 border rounded-lg overflow-hidden"
            >
              <Image
                className="object-cover"
                fill
                src={img}
                alt={`product-item-${i}`}
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="hidden lg:block">
        <div className="flex flex-col gap-4">
          <div className="relative w-full h-40 rounded-lg border overflow-hidden">
            <Image
              className="object-cover"
              fill
              src={images[index]!}
              alt="product-img"
            />
          </div>

          <div className="grid grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-full aspect-square cursor-pointer rounded-lg border overflow-hidden",
                  index === i && "border-2 border-black"
                )}
                onClick={() => setIndex(i)}
                onMouseEnter={() => setIndex(i)}
              >
                <Image
                  className="object-cover"
                  fill
                  src={img}
                  alt="product-img-option"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageSlider;
