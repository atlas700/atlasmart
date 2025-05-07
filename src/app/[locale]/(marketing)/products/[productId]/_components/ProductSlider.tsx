"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Props = {
  images: string[];
};

const ProductSlider = ({ images }: Props) => {
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className="md:hidden">
        <Carousel
          className="w-full"
          swipeable={true}
          showThumbs={false}
          infiniteLoop
          showStatus={false}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative w-full h-[70vh] border shadow-md rounded-lg overflow-hidden"
            >
              <Image
                className="object-cover"
                fill
                src={img}
                alt={`product-slider-item-${i}`}
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="hidden md:block">
        <div className="flex gap-5">
          <div className="flex flex-col gap-2">
            {images.map((image, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-16 h-16 rounded-lg border border-gray-300 overflow-hidden cursor-pointer",
                  index === i && "border-2 border-black"
                )}
                onClick={() => setIndex(i)}
                onMouseEnter={() => setIndex(i)}
              >
                <Image
                  className="object-cover"
                  src={image}
                  fill
                  alt={`product-detail-${i}-img`}
                />
              </div>
            ))}
          </div>

          <div className="flex-1">
            <div className="relative w-full h-[80vh] rounded-lg border overflow-hidden shadow-md">
              <Image
                className="object-cover"
                src={images[index]!}
                fill
                alt={`curr-product-detail-img`}
              />

              {images.length > 1 && (
                <div className="absolute z-20 bottom-5 right-5 flex items-center gap-3">
                  <button
                    className={cn(
                      "bg-black/75 flex items-center justify-center p-2 text-white rounded-full"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (index !== 0) {
                        setIndex((prev) => prev - 1);
                      } else {
                        setIndex(images.length - 1);
                      }
                    }}
                  >
                    <ArrowLeft />
                  </button>

                  <button
                    className={cn(
                      "bg-black/75 flex items-center justify-center p-2 text-white rounded-full"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (index !== images.length - 1) {
                        setIndex((prev) => prev + 1);
                      } else {
                        setIndex(0);
                      }
                    }}
                  >
                    <ArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductSlider;
