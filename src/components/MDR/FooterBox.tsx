import React, { forwardRef, useState, useEffect, useRef } from "react";

interface FooterBoxProps {
  label: number;
  percentage: string;
  open: boolean;
}

const FooterBox = forwardRef<HTMLDivElement, FooterBoxProps>(
  ({ label, percentage, open }, ref) => {
    // Ref to skip effect on initial mount.
    const initialMountRef = useRef(true);

    // New state to force the door to remain open for 5 seconds
    const [forceOpen, setForceOpen] = useState(false);
    // State to control whether the expanded (tall) panel is shown
    const [showExpanded, setShowExpanded] = useState(false);
    // State to trigger the inner progress bars' animation (from 0 to 100%)
    const [animateInner, setAnimateInner] = useState(false);

    // When the percentage updates (but not on initial mount), trigger the new behaviors:
    useEffect(() => {
      if (initialMountRef.current) {
        initialMountRef.current = false;
        return;
      }

      // Force door open for 5 seconds
      setForceOpen(true);
      const forceTimer = setTimeout(() => {
        setForceOpen(false);
      }, 3800);

      // Wait 1 second before expanding the tall panel
      const expandTimer = setTimeout(() => {
        setShowExpanded(true);
        setAnimateInner(true);
      }, 1000);

      // After 2 seconds of the panel appearing, retract it
      const retractTimer = setTimeout(() => {
        setShowExpanded(false);
        setAnimateInner(false);
      }, 1000 + 2000);

      return () => {
        clearTimeout(forceTimer);
        clearTimeout(expandTimer);
        clearTimeout(retractTimer);
      };
    }, [percentage]);

    // Use effective open state (either the parent's open prop or our forced open state)
    const effectiveOpen = open || forceOpen;

    // Door animation transition.
    const doorTransition = effectiveOpen
      ? "transform 0.4s ease, opacity 0.16s ease-out"
      : "transform 0.4s ease, opacity 0.16s ease-out 0.3s";

    const leftDoorStyle: React.CSSProperties = {
      position: "absolute",
      top: -6,
      left: 1,
      width: "48.5%",
      border: "2px solid white",
      height: "7px",
      backgroundColor: "black",
      transformOrigin: "left center",
      transition: doorTransition,
      transform: effectiveOpen ? "rotate(-137deg)" : "rotate(0deg)",
      opacity: effectiveOpen ? 1 : 0,
      zIndex: 2,
    };

    const rightDoorStyle: React.CSSProperties = {
      position: "absolute",
      top: -6,
      right: 1,
      border: "2px solid white",
      width: "48.5%",
      height: "7px",
      backgroundColor: "black",
      transformOrigin: "right center",
      transition: doorTransition,
      transform: effectiveOpen ? "rotate(137deg)" : "rotate(0deg)",
      opacity: effectiveOpen ? 1 : 0,
      zIndex: 2,
    };

    const animatedBarStyle: React.CSSProperties = {
      position: "absolute",
      left: -1,
      bottom: "100%", // Align the bottom of the bar with the top of the box.
      width: "100%",
      height: "8px",
      border: "2px solid white",
      backgroundColor: "black",
      transformOrigin: "bottom",
      transform: effectiveOpen ? "scaleY(1)" : "scaleY(0)",
      transition: "transform 0.35s ease",
      zIndex: 10,
    };

    return (
      <div
        ref={ref}
        style={{
          width: "16%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "visible",
          zIndex: 10001,
          margin: "0 5px",
        }}>
        {/* Top Box: label container with door elements, animated bar, and expanded panel */}
        <div
          style={{
            width: "100%",
            height: "40px", // Slightly taller top box
            border: "2px solid white",
            display: "flex",
            zIndex: 10001,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            boxSizing: "border-box",
            position: "relative",
          }}>
          {/* Animated bar (scales upward) */}
          <div style={animatedBarStyle} />
          {/* Door elements */}
          <div style={leftDoorStyle} />
          <div style={rightDoorStyle} />
          {/* Label text */}
          <div style={{ position: "relative", zIndex: 3, fontSize: 21 }}>
            {`0${label}`}
          </div>
          {/* Expanded Panel (tall rectangle) - positioned to expand upward */}
          <div
            style={{
              position: "absolute",
              bottom: "100%", // Anchor to the top of the box so it expands upward
              left: -1.2,
              border: "2px solid white",
              padding: showExpanded ? "5px 5px 5px 5px" : "0px 5px 0px 5px",
              width: "94%",
              height: showExpanded ? "176px" : "0px",
              overflow: "hidden",
              backgroundColor: "black",
              transition: "height 0.3s ease",
              zIndex: 20,
            }}>
            {/* Always render the content, but control its opacity */}
            <div
              style={{
                opacity: showExpanded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}>
              {/* Header rectangle with same label */}
              <div
                style={{
                  height: "30px",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "5px",
                  fontSize: 22,
                }}>
                {`0${label}`}
              </div>
              {/* Row for WO */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "7px",
                }}>
                <div
                  style={{
                    width: "30px",
                    color: "#5e5",
                    fontWeight: "bold",
                  }}>
                  WO
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "16px",
                    border: "2px solid #5e5",
                    backgroundColor: "#000",
                    marginLeft: "5px",
                    position: "relative",
                  }}>
                  <div
                    style={{
                      height: "100%",
                      width: animateInner ? "100%" : "0%",
                      backgroundColor: "#5e5",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
              {/* Row for FC */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "7px",
                }}>
                <div
                  style={{
                    width: "30px",
                    color: "yellow",
                    fontWeight: "bold",
                  }}>
                  FC
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "16px",
                    border: "2px solid yellow",
                    backgroundColor: "#000",
                    marginLeft: "5px",
                    position: "relative",
                  }}>
                  <div
                    style={{
                      height: "100%",
                      width: animateInner ? "100%" : "0%",
                      backgroundColor: "yellow",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
              {/* Row for DR */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "7px",
                }}>
                <div
                  style={{
                    width: "30px",
                    color: "pink",
                    fontWeight: "bold",
                  }}>
                  DR
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "16px",
                    border: "2px solid pink",
                    backgroundColor: "#000",
                    marginLeft: "5px",
                    position: "relative",
                    marginBottom: "7px",
                  }}>
                  <div
                    style={{
                      height: "100%",
                      width: animateInner ? "100%" : "0%",
                      backgroundColor: "pink",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
              {/* Row for MA */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "30px",
                    color: "white",
                    fontWeight: "bold",
                  }}>
                  MA
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "16px",
                    border: "2px solid white",
                    backgroundColor: "#000",
                    marginLeft: "5px",
                    position: "relative",
                    marginBottom: "3px",
                  }}>
                  <div
                    style={{
                      height: "100%",
                      width: animateInner ? "100%" : "0%",
                      backgroundColor: "white",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thin gap */}
        <div style={{ height: "6px" }} />

        {/* Bottom Box: percentage container (animated progress bar) */}
        <div
          style={{
            width: "100%",
            height: "33px", // Slightly shorter bottom box
            border: "1px solid white",
            position: "relative",
            backgroundColor: "transparent",
            boxSizing: "border-box",
          }}>
          {/* Progress fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: percentage, // e.g. "50%"
              backgroundColor: "white",
              transition: "width 0.5s ease",
              zIndex: 1,
            }}
          />
          {/* Text overlay */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              height: "100%",
              paddingLeft: "5px",
              fontSize: 19,
            }}>
            {/* White text covering full area */}
            <div
              style={{
                color: "white",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                paddingLeft: "5px",
              }}>
              {percentage}
            </div>
            {/* Black text clipped to the progress fill */}
            <div
              style={{
                color: "black",
                position: "absolute",
                top: 0,
                left: 0,
                width: percentage,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                paddingLeft: "4fdpx",
                pointerEvents: "none",
              }}>
              {percentage}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default FooterBox;
