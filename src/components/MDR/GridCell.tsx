import React, { useLayoutEffect, useState } from "react";

export interface CellData {
  digit: number | null;
  duration: number;
  delay: number;
  spawnDuration: number;
  spawnDelay: number;
  shapeId?: number;
}

interface GridCellProps {
  cellData: CellData;
  cellWidth: number;
  cellHeight: number;
  scaleClass: string;
  visible: boolean;
  onHover: () => void;
  isStatic: boolean;
  isVisited: boolean;
}

const GridCell: React.FC<GridCellProps> = ({
  cellData,
  cellWidth,
  cellHeight,
  scaleClass,
  visible,
  onHover,
  isStatic,
  isVisited,
}) => {
  // "version" forces a remount whenever the cell data changes.
  const [version, setVersion] = useState(0);
  // Tracks if the spawn animation has completed.
  const [spawnComplete, setSpawnComplete] = useState(false);
  // Controls when we start applying the spawn animation.
  const [startAnimation, setStartAnimation] = useState(false);

  // Use useLayoutEffect so that we update before the browser paints.
  useLayoutEffect(() => {
    // Increment version to force a remount.
    setVersion((v) => v + 1);
    setSpawnComplete(false);
    // Start with the element hidden.
    setStartAnimation(false);
    // Use a double requestAnimationFrame to ensure the browser
    // applies the hidden styles before we turn on the animation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStartAnimation(true);
      });
    });
  }, [cellData.digit, cellData.spawnDuration, cellData.spawnDelay]);

  // Define the spawn animation style.
  const spawnAnimation = `spawnScale ${cellData.spawnDuration}s ease-out ${cellData.spawnDelay}s both`;
  const wobbleStyle = {
    animationDuration: `${cellData.duration}s`,
    animationDelay: `${cellData.delay}s`,
  };

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLSpanElement>) => {
    if (e.animationName === "spawnScale" && !spawnComplete) {
      setSpawnComplete(true);
    }
  };

  const visitedStyle = isVisited
    ? {
        color: "#cff1fa",
        opacity: "100%",
        fontWeight: "bold",
        textShadow: "#cff1fa 0px 0 10px",
      }
    : {};

  let animationStyle = {};
  if (!spawnComplete) {
    // While the spawn animation is running, use the spawn animation.
    animationStyle = { animation: spawnAnimation, ...visitedStyle };
  } else if (isStatic) {
    animationStyle = { ...visitedStyle };
  } else if (visible) {
    animationStyle = { ...wobbleStyle, ...visitedStyle };
  } else {
    animationStyle = { ...visitedStyle };
  }

  // Until startAnimation is true, force the element into its initial (hidden) state.
  const combinedStyle: React.CSSProperties = startAnimation
    ? { ...animationStyle, willChange: "opacity, transform" }
    : {
        visibility: "hidden",
        opacity: 0,
        transform: "scale(0)",
        willChange: "opacity, transform",
        ...visitedStyle,
      };

  return (
    <div
      style={{
        width: `${cellWidth}px`,
        height: `${cellHeight}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#acecfc",
      }}
      onMouseEnter={onHover}>
      <div className={`cellScale ${scaleClass}`}>
        {visible ? (
          <span
            key={version}
            style={combinedStyle}
            onAnimationEnd={handleAnimationEnd}
            className={
              spawnComplete && !isStatic && visible ? "cellAnimate" : ""
            }>
            {cellData.digit !== null ? cellData.digit : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default GridCell;
