import React from "react";

const Spinner = () => {
  return (
    <div
      className="w-full flex items-center justify-center py-5"
      aria-label="Loading..."
    >
      <div className="w-10 h-10 rounded-full border-t border-l border-black animate-spin" />
    </div>
  );
};

export default Spinner;
