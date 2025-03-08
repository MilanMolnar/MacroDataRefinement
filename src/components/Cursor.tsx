import { useState, useEffect } from "react";

function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate offsets based on viewBox and rendered size.
  const renderedWidth = 35; // px
  const renderedHeight = 35; // px
  const tipX = (15 / 100) * renderedWidth; // 15 in viewBox corresponds to ~5.25px
  const tipY = (5 / 100) * renderedHeight; // 5 in viewBox corresponds to ~1.75px

  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 100 100"
      style={{
        position: "fixed",
        left: mousePos.x - 320,
        top: mousePos.y - 260,
        transform: `translate(-${tipX}px, -${tipY}px)`,
        pointerEvents: "none",
        zIndex: 9999,
      }}>
      <path
        d="
          M 15 5
          L 90 40
          L 60 55
          L 40 90
          Z
        "
        fill="none"
        stroke="#acecfc"
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CustomCursor;
