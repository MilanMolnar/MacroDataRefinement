import React, { useEffect, useState } from "react";
import LumonLogo from "./LumonLogo";

interface HeaderProps {
  headerText: string;
  percentage: number;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ headerText, percentage }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(percentage);

  useEffect(() => {
    let start: number | null = null;
    const initialValue = animatedPercentage;
    const change = percentage - initialValue;
    const duration = 1000; // Animation duration in ms

    // Ease in-out function for a smooth slow-fast-slow animation
    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    let rafId: number;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedPercentage(
        Math.round(initialValue + change * easeInOutQuad(progress))
      );
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [percentage]);

  // Configuration for the background bars:
  const numBars = 30;
  const slotWidth = 35; // Fixed slot width for each bar (in px)
  const maxBarWidth = 16; // Full (base) width for an active bar (in px)
  const minWidth = 0.1; // Minimum visible bar width (in px)
  const thicknessDecrement = 0.4; // Decrease in bar width per active step
  const minOpacity = 0.03; // Minimum opacity for every bar
  const opacityDecrement = 0.044; // Loss in opacity per active step

  // Active bars appear from left to right:
  const activeBars = Math.round((animatedPercentage / 100) * numBars);

  return (
    <header
      style={{
        width: "90%",
        minHeight: "70px",
        margin: "25px auto 30px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        boxSizing: "border-box",
        borderTop: "2px solid #acecfc",
        borderBottom: "2px solid #acecfc",
        borderLeft: "2px solid #acecfc",
        borderRight: "none",
        backgroundColor: "#000",
        overflow: "visible",
      }}>
      {/* Background vertical progress bars, rendered only up to the logo area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 10, // matches header's left padding
          right: 190, // stops before the logo reserved area
          bottom: 0,
          zIndex: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}>
        {Array.from({ length: numBars }).map((_, index) => {
          let computedWidth: number;
          let computedOpacity: number;
          if (index < activeBars) {
            // For active bars (from left to right), compute a gradient.
            // The leftmost active bar (index = 0) uses the minimum values,
            // and the rightmost (index = activeBars - 1) is at full width/opacity.
            const activeIndex = index;
            computedWidth = Math.max(
              maxBarWidth - (activeBars - 1 - activeIndex) * thicknessDecrement,
              minWidth
            );
            computedOpacity = Math.max(
              1 - (activeBars - 1 - activeIndex) * opacityDecrement,
              minOpacity
            );
          } else {
            // Inactive bars use the minimum values.
            computedWidth = minWidth;
            computedOpacity = minOpacity;
          }
          return (
            // Each bar is rendered inside a fixed-width slot.
            <div
              key={index}
              style={{
                width: `${slotWidth}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}>
              <div
                style={{
                  width: `${computedWidth}px`,
                  height: "100%",
                  backgroundColor: `rgba(172, 236, 252, ${computedOpacity})`,
                  transition: "width 0.3s ease, background-color 0.3s ease",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Header content */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: "bold",
            marginLeft: "5px",
            color: "#acecfc",
            textShadow: "4px 4px 10px #000", // Added black shadow to the file name
          }}>
          {headerText}
        </div>
        <p
          style={{
            marginLeft: "10px",
            fontSize: 38,
            fontWeight: "bold",
            color: "black", // fallback color
            WebkitTextFillColor: "black", // ensures the text fill is black
            WebkitTextStroke: "1px #acecfc", // outline color
            marginRight: "190px",
          }}>
          {animatedPercentage}% Complete
        </p>
      </div>

      {/* Logo positioned as in the original */}
      <div
        style={{
          position: "absolute",
          right: "-20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}>
        <LumonLogo />
      </div>
    </header>
  );
};

export default Header;
