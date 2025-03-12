import { useState, useEffect } from "react";

function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Rendered size of the SVG
  const renderedWidth = 35; // px
  const renderedHeight = 35; // px
  // Center the SVG on the mouse pointer by subtracting half its dimensions
  const offsetX = renderedWidth / 2 - 10;
  const offsetY = renderedHeight / 2 - 10;

  return (
    <svg
      width={renderedWidth}
      height={renderedHeight}
      viewBox="0 0 100 100"
      style={{
        position: "fixed",
        left: mousePos.x - offsetX,
        top: mousePos.y - offsetY,
        pointerEvents: "none",
        zIndex: 10,
      }}>
      <path
        d="M 15 5 L 90 40 L 60 55 L 40 90 Z"
        fill="none"
        stroke="#acecfc"
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CustomCursor;
