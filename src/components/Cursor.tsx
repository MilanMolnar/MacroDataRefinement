import { useState, useEffect } from "react";

function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 100 100"
      style={{
        position: "fixed",
        left: mousePos.x,
        top: mousePos.y,
        transform: "translate(-15%, -10%)", // Adjust so tip is under cursor
        pointerEvents: "none",
        zIndex: 9999,
      }}>
      <path
        /*
          Explanation of the shape:
          
          - M 15 5   : Move to the tip (top-left corner of the shape).
          - L 90 40  : Draw the top edge to the right.
          - L 80 60  : Move partway down/left for the bottom side, forming an inward corner (the "notch").
          - L 40 90  : Continue to the bottom-left corner to finish that side.
          - Z        : Close the path back to the tip.

          Feel free to tweak these coordinates to adjust the angles, 
          length, or how big the notch is (e.g., move "80 60" up/down).
        */
        d="
          M 15 5
          L 90 40
          L 60 55
          L 40 90
          Z
        "
        fill="none"
        stroke="#fff"
        strokeWidth="8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CustomCursor;
