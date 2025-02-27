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

    // Ease in-out function: slow-fast-slow effect
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

  return (
    <header
      style={{
        width: "90%",
        height: "70px",
        margin: "20px auto 30px",
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flex: 1,
        }}>
        <div style={{ fontSize: 28, fontWeight: "bold", marginLeft: "5px" }}>
          {headerText}
        </div>
        <div style={{ marginLeft: "10px", fontSize: 28 }}>
          <span
            style={{
              color: "black",
              WebkitTextStroke: "1px #acecfc",
              marginRight: "190px",
            }}>
            {animatedPercentage}% Complete
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: "-20px",
          top: "50%",
          transform: "translateY(-50%)",
        }}>
        <LumonLogo></LumonLogo>
      </div>
    </header>
  );
};

export default Header;
