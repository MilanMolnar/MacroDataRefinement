import { useEffect, useState } from "react";
import secondPartSoundSrc from "../../../assets/sounds/binit.mp3";

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
  // Offsets of the container relative to the viewport.
  offsetX?: number;
  offsetY?: number;
}

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const FlyToBoxOverlay = ({
  flyDigits,
  onAnimationEnd,
  offsetX = 0,
  offsetY = 0,
}: FlyToBoxOverlayProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    // Play sound for the second part of the animation after 600ms.
    const soundTimer = setTimeout(() => {
      const audio = new Audio(secondPartSoundSrc);
      audio.volume = 0.4;
      audio.play();
    }, 600);

    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 1200);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(timer);
    };
  }, [onAnimationEnd]);

  return (
    <div
      style={{
        position: "absolute", // now relative to the container
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 1000,
      }}>
      {flyDigits.map((fd, index) => {
        // Convert global coordinates to container-relative.
        const startX = fd.startX - offsetX;
        const startY = fd.startY - offsetY;
        const targetX = fd.targetX - offsetX;
        const targetY = fd.targetY - offsetY;
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        const overshoot = 150;
        // Add a tiny extra offset per digit (3px per digit) only at the end of phase 1.
        const spacingX = 6;
        const extraOffsetX = index * spacingX;
        const animationStyle = animate
          ? { animation: `fly-${fd.id} 1.2s ease-in-out forwards` }
          : {};

        return (
          <div
            key={fd.id}
            style={{
              position: "absolute",
              left: startX,
              top: startY,
              fontSize: "24px",
              color: "#acecfc",
              fontWeight: "bold",
              willChange: "transform",
              transform: "translate3d(0,0,-20px)",
              ...animationStyle,
            }}>
            {fd.digit}
            <style>{`
              @keyframes fly-${fd.id} {
                0% { 
                  transform: translate3d(0, 0, 0); 
                  opacity: 1;
                }
                60% { 
                  transform: translate3d(${deltaX + extraOffsetX}px, ${
              deltaY - overshoot + random(1, 4) * 6
            }px, 0);
                  opacity: 1;
                }
                70% { 
                  opacity: 0.5;
                }
                100% { 
                  transform: translate3d(${deltaX + extraOffsetX}px, ${
              deltaY - 30
            }px, 0);
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
