"use client ";

import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";

type OptionType = {
  value: string;
  label: string;
};

type Props = {
  value: string[];
  testId?: string;
  placeholder?: string;
  onChange: (value: string[]) => void;
  options: OptionType[];
};

const MultiSelect = ({
  value,
  testId,
  onChange,
  options,
  placeholder,
}: Props) => {
  const ref = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter((val) => val !== selectedValue)
      : [...value, selectedValue];

    onChange(newValue);
  };
  // @ts-ignore
  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="bg-background w-full h-10 flex items-center justify-between py-2 px-3 border border-input rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        onClick={() => setIsOpen((prev) => !prev)}
        data-cy={`${testId}-select`}
      >
        {value.length > 0 ? (
          <div>
            {value
              .map(
                (val) =>
                  options.find((option) => option.value === val)?.label || val
              )
              .join(", ")}
          </div>
        ) : (
          <div>{placeholder || "Choose..."}</div>
        )}

        <div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-[46px] z-50 w-full bg-background p-1 border border-input rounded-md shadow-sm">
          <div className="flex flex-col">
            {options.map((option, i) => (
              <button
                key={i}
                type="button"
                className="pl-8 py-1.5 pr-2 text-sm text-left font-semibold hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                onClick={() => {
                  toggleOption(option.value);
                }}
                data-cy={`${testId}-select-${i}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
