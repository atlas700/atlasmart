import React from "react";
import { cn } from "@/lib/utils";
import { FaStar, FaRegStar } from "react-icons/fa6";

type Props = {
  className?: string;
  ratings: number[];
};

const AverageRating = ({ className, ratings }: Props) => {
  const totalRatings = ratings.reduce((total, rating) => total + rating, 0);

  const averageRating = Math.round(totalRatings / ratings.length);

  if (ratings.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {new Array(5).fill("").map((_, index) => (
        <span key={index}>
          {averageRating >= index + 1 ? (
            <FaStar className="w-4 h-4 text-yellow-500" />
          ) : (
            <FaRegStar className="w-4 h-4 text-yellow-500" />
          )}
        </span>
      ))}
    </div>
  );
};

export default AverageRating;
