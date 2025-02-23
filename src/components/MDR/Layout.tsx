import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import Grid from "./Grid";
import FooterBar from "./FooterBar";
import FooterText from "./FooterText";
import AnimationStyles from "./AnimationStyles";
import { ShapeType } from "./shapeDefinitions";
import FlyToBoxOverlay, { FlyDigit } from "./FlyToBoxOverlay";
import { Settings } from "./../Settings";
import winSoundSrc from "../../assets/sounds/win-final.mp3";

interface SeveranceMDRLayoutProps {
  headerText: string;
  percentage: string;
  logoUrl?: string;
  settings: Settings;
}

const SeveranceMDRLayout: React.FC<SeveranceMDRLayoutProps> = ({
  headerText,
  logoUrl,
  settings,
}) => {
  // Destructure settings values
  const {
    containerWidth,
    containerHeight,
    msToHelp,
    rows,
    cols,
    headerHeight,
    shapePerType,
  } = settings;

  const gridHeight = containerHeight - headerHeight - 170;
  const cellWidth = 24;
  const cellHeight = 32;
  const rowGap = 8;
  const colGap = 8;
  const lineStyle: React.CSSProperties = {
    margin: 0,
    border: "1px solid #acecfc",
  };
  const lineStyleBlack: React.CSSProperties = {
    margin: 0,
    border: "1px solid black",
  };

  // Footer progress state.
  const [footerProgress, setFooterProgress] = useState<
    Record<ShapeType, number>
  >({
    plus: 0,
    L: 0,
    T: 0,
    rectangle: 0,
    hline: 0,
  });

  // Which footer box is open.
  const [openFooterBox, setOpenFooterBox] = useState<number | null>(null);

  // Fly digits state and currently animating shape.
  const [flyDigits, setFlyDigits] = useState<FlyDigit[]>([]);
  const [animatingShapeId, setAnimatingShapeId] = useState<number | null>(null);

  // Refs for the five footer boxes.
  const footerBoxRefs = useRef<(HTMLDivElement | null)[]>([]);
  if (footerBoxRefs.current.length !== 5) {
    footerBoxRefs.current = Array(5).fill(null);
  }

  // Compute header percentage.
  const headerPercentage = useMemo(() => {
    const completeCount = Object.values(footerProgress).filter(
      (val) => val === 100
    ).length;
    return completeCount * 20;
  }, [footerProgress]);

  // Show modal only once when header is 100% and all boxes are closed.
  const [showGGModal, setShowGGModal] = useState(false);
  const modalTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      headerPercentage === 100 &&
      openFooterBox === null &&
      !modalTriggeredRef.current
    ) {
      modalTriggeredRef.current = true;
      // Wait 2 seconds before showing the modal and playing the win sound.
      setTimeout(() => {
        const winAudio = new Audio(winSoundSrc);
        winAudio.volume = 0.7;
        winAudio.play().catch(() => {});
        setShowGGModal(true);
      }, 2000);
    }
  }, [headerPercentage, openFooterBox]);

  // Determine the bounding rect of the currently open footer box.
  const [targetFooterBoxRect, setTargetFooterBoxRect] =
    useState<DOMRect | null>(null);
  useEffect(() => {
    if (openFooterBox !== null && footerBoxRefs.current[openFooterBox - 1]) {
      const rect =
        footerBoxRefs.current[openFooterBox - 1]!.getBoundingClientRect();
      setTargetFooterBoxRect(rect);
    }
  }, [openFooterBox]);

  // Track which shape just completed so that Grid refreshes only its cells.
  const [completedShapeId, setCompletedShapeId] = useState<number | null>(null);

  // Called when a shape’s fly animation starts.
  const handleAnimationStart = (digits: FlyDigit[], shapeId: number) => {
    setFlyDigits(digits);
    setAnimatingShapeId(shapeId);
  };

  // Called when the fly animation ends.
  const handleAnimationEnd = () => {
    setCompletedShapeId(animatingShapeId);
    setFlyDigits([]);
    setAnimatingShapeId(null);
  };

  return (
    <>
      <AnimationStyles />
      {/* Win Modal */}
      {showGGModal && (
        <div
          onClick={() => setShowGGModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50000,
            pointerEvents: "auto",
            cursor: "pointer",
          }}>
          <div
            style={{
              border: "4px double #acecfc",
              padding: "20px 40px",
              fontSize: "5rem",
              color: "#acecfc",
              fontFamily: "monospace",
              backgroundColor: "black",
              width: "800px",
              textAlign: "center",
              transform: "scale(0)",
              animation: "scaleUp 1.1s ease-out forwards",
            }}>
            100%
          </div>
          <style>{`
            @keyframes scaleUp {
              from { transform: scale(0); }
              to { transform: scale(1); }
            }
          `}</style>
        </div>
      )}
      <div
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight + 60}px`,
          marginBottom: "5px",
          backgroundColor: "black",
          color: "#acecfc",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          outline: "none",
          animation: "fadeIn 1s ease-out forwards",
        }}>
        <Header
          headerText={headerText}
          percentage={headerPercentage}
          logoUrl={logoUrl}
        />
        <hr style={lineStyle} />
        <hr style={lineStyleBlack} />
        <hr style={lineStyle} />
        <div style={{ padding: "0px" }}>
          <Grid
            msToHelp={msToHelp}
            shapePerType={shapePerType}
            containerWidth={containerWidth}
            containerHeight={gridHeight}
            rows={rows}
            cols={cols}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            rowGap={rowGap}
            colGap={colGap}
            onShapeCompleted={(shapeType: ShapeType) =>
              setFooterProgress((prev) => ({
                ...prev,
                [shapeType]: Math.min(
                  prev[shapeType] + 100 / shapePerType,
                  100
                ),
              }))
            }
            openFooterBox={openFooterBox}
            targetFooterBoxRect={targetFooterBoxRect}
            onAnimationStart={handleAnimationStart}
            refreshCompletedShapeId={completedShapeId}
            onShapeRefreshed={() => setCompletedShapeId(null)}
          />
        </div>
        <hr style={lineStyle} />
        <hr style={lineStyleBlack} />
        <hr style={lineStyle} />
        <div style={{ position: "relative", zIndex: 11000 }}>
          <FooterBar
            progress={footerProgress}
            openBox={openFooterBox}
            setOpenBox={setOpenFooterBox}
            footerBoxRefs={footerBoxRefs}
          />
        </div>
        <hr style={lineStyle} />
        <FooterText />
      </div>

      {flyDigits.length > 0 && (
        <FlyToBoxOverlay
          flyDigits={flyDigits}
          onAnimationEnd={handleAnimationEnd}
        />
      )}
    </>
  );
};

export default SeveranceMDRLayout;
