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
  viewportScale?: number;
}

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const FlyToBoxOverlay = ({
  flyDigits,
  onAnimationEnd,
  viewportScale = 1,
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
        // Rendered via ReactDOM.createPortal at document.body so position:fixed
        // is always relative to the true viewport — unaffected by any CSS
        // transform on the game container.
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 5000,
      }}>
      {flyDigits.map((fd, index) => {
        // fd.startX/Y and fd.targetX/Y are already in viewport coordinates,
        // so they can be used directly with position:fixed.
        const startX = fd.startX;
        const startY = fd.startY;
        const deltaX = fd.targetX - startX;
        const deltaY = fd.targetY - startY;
        const overshoot = 150;
        // Scale spacing so digits don't overlap disproportionately at small sizes.
        const spacingX = 6 * viewportScale;
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
              fontSize: `${Math.round(24 * viewportScale)}px`,
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
