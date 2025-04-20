"use client";

import { useState, useLayoutEffect } from "react";

export function GetCurrentYear() {
  const [year, setYear] = useState<number | null>(null);

  useLayoutEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year) {
    return year;
  }
  return null;
}
