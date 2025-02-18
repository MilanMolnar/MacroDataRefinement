import React, { useEffect, useState } from "react";

export interface FlyDigit {
  id: string;
  digit: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface FlyToBoxOverlayProps {
  flyDigits: FlyDigit[];
  onAnimationEnd: () => void;
}
const FlyToBoxOverlay = ({
  flyDigits,
  onAnimationEnd,
}: FlyToBoxOverlayProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 1200); // total animation duration
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 0, // should be lower than the footer's z-index
      }}>
      {flyDigits.map((fd) => {
        // Calculate the horizontal and vertical displacement.
        const deltaX = fd.targetX - fd.startX;
        const deltaY = fd.targetY - fd.startY;

        // Define an overshoot offset (e.g., 50px higher than the box)
        const overshoot = 150;

        // Build a keyframe animation with an intermediate overshoot step.
        const animationStyle = animate
          ? {
              animation: `fly-${fd.id} 1.2s ease-in-out forwards`,
            }
          : {};

        return (
          <div
            key={fd.id}
            style={{
              zIndex: 1,
              position: "absolute",
              left: fd.startX,
              top: fd.startY,
              fontSize: "24px",
              color: "white",
              fontWeight: "bold",
              willChange: "transform",
              transform: "translate3d(0,0,-20px)",
              ...animationStyle,
            }}>
            {fd.digit}
            {/* Define keyframes inline */}
            <style>{`
  @keyframes fly-${fd.id} {
    0% { 
      transform: translate3d(0, 0, 0); 
      opacity: 1;
    }
    60% { 
      transform: translate3d(${deltaX}px, ${deltaY - overshoot}px, 0);
      opacity: 1;
    }
    70% { 
      opacity: 0.5;
    }
    100% { 
      transform: translate3d(${deltaX}px, ${deltaY - 30}px, 0);
      opacity: 0;
    }
  }
`}</style>
          </div>
        );
      })}
    </div>
  );
};

export default FlyToBoxOverlay;
