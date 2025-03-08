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
import CustomAlert from "./CustomAlert";

interface SeveranceMDRLayoutProps {
  headerText: string;
  percentage: string;
  logoUrl?: string;
  settings: Settings;
  // New prop to notify parent when win condition is met.
  onWin?: () => void;
}

const SeveranceMDRLayout: React.FC<SeveranceMDRLayoutProps> = ({
  headerText,
  logoUrl,
  settings,
  onWin,
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

  const gridHeight = containerHeight - headerHeight - 155;
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
  // Helper function to round up a percentage to two decimal places when more than one shape exists
  const getRoundedPercentage = (
    current: number,
    increment: number,
    totalShapes: number
  ): number => {
    let newPercentage = current + increment;
    if (totalShapes > 1) {
      // Multiply by 100, round up, then divide back to ensure two decimals
      newPercentage = Math.ceil(newPercentage * 100) / 100;
    }
    return Math.min(newPercentage, 100);
  };
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

  // Create a ref for the main container.
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Compute the container's offset relative to the viewport.
  useEffect(() => {
    const updateOffset = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setOffset({ x: rect.left, y: rect.top });
      }
    };

    // Calculate the offset initially.
    updateOffset();

    // Recalculate the offset on window resize.
    window.addEventListener("resize", updateOffset);
    return () => {
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  // Compute header percentage.
  const headerPercentage = useMemo(() => {
    const completeCount = Object.values(footerProgress).filter(
      (val) => val === 100
    ).length;
    return completeCount * 20;
  }, [footerProgress]);

  // Show win modal only once when header is 100% and all boxes are closed.
  const [showGGModal, setShowGGModal] = useState(false);
  const modalTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      headerPercentage === 100 &&
      openFooterBox === null &&
      !modalTriggeredRef.current
    ) {
      modalTriggeredRef.current = true;
      // Notify the parent component that the win condition is reached.
      if (onWin) onWin();
      // Wait 2 seconds before showing the modal and playing the win sound.
      setTimeout(() => {
        const winAudio = new Audio(winSoundSrc);
        winAudio.volume = 0.7;
        winAudio.play().catch(() => {});
        setShowGGModal(true);
      }, 2000);
    }
  }, [headerPercentage, openFooterBox, onWin]);

  useEffect(() => {
    const handleOpenFooterBox = (event: Event) => {
      const customEvent = event as CustomEvent<{ box: number }>;
      setOpenFooterBox(customEvent.detail.box);
    };

    window.addEventListener("openFooterBox", handleOpenFooterBox);
    return () => {
      window.removeEventListener("openFooterBox", handleOpenFooterBox);
    };
  }, []);

  // New state to track the thank-you modal.
  const [showThankYouModal, setShowThankYouModal] = useState(false);

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

  // Handler for dismissing the winning modal:
  // When dismissed, show the thank-you modal.
  const handleWinningModalDismiss = () => {
    setShowGGModal(false);
    setShowThankYouModal(true);
  };
  const copyShareMessage = () => {
    const shareMessage = `I have brought glory to the company, try out this Lumon MDR simulator and make Kier proud. Link: ${window.location.href}`;
    navigator.clipboard
      .writeText(shareMessage)
      .then(() => {
        setAlertMessage("Share message copied! Paste it for your friends.");
      })
      .catch(() => {
        setAlertMessage("Failed to copy share message. Please try again.");
      });
  };
  const [alertMessage, setAlertMessage] = useState("");
  return (
    <>
      <AnimationStyles />
      {/* Win Modal */}
      {showGGModal && (
        <div
          onClick={handleWinningModalDismiss}
          style={{
            position: "fixed",
            top: -100,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5001,
            pointerEvents: "auto",
            cursor: "pointer",
          }}>
          <div
            style={{
              border: "4px double #acecfc",
              padding: "20px 20px",
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

      {/* Main Container */}
      <div
        style={{
          width: `${containerWidth + 50}px`,
          height: `${containerHeight + 200}px`,

          marginBottom: "5px",

          backgroundColor: "black",

          position: "relative", // <-- This is key!
        }}>
        <div
          ref={containerRef}
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight + 70}px`,

            marginBottom: "5px",
            padding: "40px",
            backgroundColor: "black",
            color: "#acecfc",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            animation: "fadeIn 4s ease-out forwards",
            position: "relative", // <-- This is key!
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
                  [shapeType]: getRoundedPercentage(
                    prev[shapeType],
                    100 / shapePerType,
                    shapePerType
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
          <div style={{ position: "relative", zIndex: 5002 }}>
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
      </div>

      {flyDigits.length > 0 && (
        <FlyToBoxOverlay
          flyDigits={flyDigits}
          onAnimationEnd={handleAnimationEnd}
          offsetX={offset.x}
          offsetY={offset.y}
        />
      )}

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div
          onClick={() => setShowThankYouModal(false)}
          style={{
            position: "fixed",
            top: -100,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 6000,
            pointerEvents: "auto",
            cursor: "pointer",
          }}>
          <div
            style={{
              border: "4px double #acecfc",
              padding: "20px 40px",
              width: "800px",
              fontSize: "1rem",
              color: "#acecfc",
              fontFamily: "monospace",
              backgroundColor: "black",
              textAlign: "left",
              lineHeight: "1.5",
              transform: "scale(0)",
              animation: "scaleUp 1.1s ease-out forwards",
            }}>
            Thank you for your exceptional work! Your dedication drives our
            excellence and enhances our company’s prestige. You can adjust your
            work environment in the settings panel — note that changes may
            sometimes yield unexpected effects. Your insights, shared with
            fellow innies, are vital for our progress. New perks are available
            in the menu (press “Esc” and look for the green highlights).
            <button
              onClick={() => {
                copyShareMessage();
              }}
              style={{
                display: "block",
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "1rem",
                fontFamily: "monospace",
                color: "#acecfc",
                backgroundColor: "black",
                border: "2px solid #acecfc",
                cursor: "pointer",
              }}>
              Share
            </button>
          </div>
          <style>{`
            @keyframes scaleUp {
              from { transform: scale(0); }
              to { transform: scale(1); }
            }
          `}</style>
        </div>
      )}
      {alertMessage && <CustomAlert message={alertMessage} />}
    </>
  );
};

export default SeveranceMDRLayout;
