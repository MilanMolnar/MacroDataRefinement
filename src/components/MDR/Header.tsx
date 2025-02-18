import React, { useEffect, useState } from "react";

interface HeaderProps {
  headerText: string;
  percentage: number;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ headerText, percentage, logoUrl }) => {
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
        border: "1px solid #fff",
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
              WebkitTextStroke: "1px white",
              marginRight: "100px",
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
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            style={{ height: "70px", width: "130px" }}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="black"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="black"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="50"
              cy="50"
              r="5"
              fill="black"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="90"
              y2="50"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="78.28"
              y2="78.28"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="90"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="21.72"
              y2="78.28"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="10"
              y2="50"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="21.72"
              y2="21.72"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="10"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="50"
              x2="78.28"
              y2="21.72"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="68.13"
              y1="58.45"
              x2="81.72"
              y2="64.79"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="56.84"
              y1="68.79"
              x2="61.97"
              y2="82.89"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="41.55"
              y1="68.13"
              x2="35.21"
              y2="81.72"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="33.62"
              y1="61.47"
              x2="21.33"
              y2="70.08"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="30.30"
              y1="46.53"
              x2="15.53"
              y2="43.92"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="31.87"
              y1="41.55"
              x2="18.28"
              y2="35.21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="38.53"
              y1="33.62"
              x2="29.92"
              y2="21.33"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="43.16"
              y1="31.21"
              x2="38.03"
              y2="17.11"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="58.45"
              y1="31.87"
              x2="64.79"
              y2="18.28"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="66.38"
              y1="38.53"
              x2="78.67"
              y2="29.92"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="68.79"
              y1="43.16"
              x2="82.89"
              y2="38.03"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="8" y="35" width="84" height="30" fill="black" />
            <text
              x="50"
              y="52"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="23"
              fontWeight="bold">
              LEMON
            </text>
          </svg>
        )}
      </div>
    </header>
  );
};

export default Header;
