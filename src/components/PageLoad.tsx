import React from "react";

const PageLoad = () => {
  return (
    <div className="w-screen h-[calc(100vh-60px)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🛍</span>

          <span className="text-3xl">AtlasMart</span>
        </div>

        <div className="w-20 h-20 rounded-full border-t-4 border-l-4 border-violet-500 animate-spin" />
      </div>
    </div>
  );
};

export default PageLoad;
