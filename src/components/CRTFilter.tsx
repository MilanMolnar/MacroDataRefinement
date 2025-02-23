import React from "react";

const CRTFilterWrapper = ({ children }: any) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Define the SVG filter for a bloom (glow) effect */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="crt-bloom">
          {/* Apply a slight blur */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="blur" />
          {/* Adjust brightness/contrast for a bloom look */}
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 18 -7"
            result="bloom"
          />
          {/* Blend the bloom with the original content */}
          <feBlend in="SourceGraphic" in2="bloom" mode="screen" />
        </filter>
      </svg>

      {/* Wrap your content and apply the filter */}
      <div
        style={{
          filter: "url(#crt-bloom)",
          // For images or canvases, this property helps create a pixelated look.
          imageRendering: "pixelated",
        }}>
        {children}
      </div>
    </div>
  );
};

export default CRTFilterWrapper;
