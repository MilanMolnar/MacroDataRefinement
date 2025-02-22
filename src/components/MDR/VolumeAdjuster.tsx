import React, { useState, useRef, useEffect, useCallback } from "react";

interface VolumeAdjusterProps {
  onVolumeChange?: (volume: number) => void;
}

type DragStart = {
  mouseY: number;
  angle: number;
};

const VolumeAdjuster: React.FC<VolumeAdjusterProps> = ({ onVolumeChange }) => {
  // Ball’s normalized position (0 = far left, 1 = far right)
  const [position, setPosition] = useState<number>(0.5);
  // Bar’s tilt (in degrees, clamped between -30 and 30)
  const [angle, setAngle] = useState<number>(0);

  // Refs to hold physics values between frames
  const velocityRef = useRef<number>(0);
  const positionRef = useRef<number>(0.5);
  const angleRef = useRef<number>(0);
  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  const lastTimeRef = useRef<number | null>(null);

  // Drag state (we use vertical dragging to change the bar's tilt)
  const dragging = useRef<boolean>(false);
  const dragStartRef = useRef<DragStart | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Continuous physics simulation: update the ball's position along the bar
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Calculate acceleration along the bar using gravity and the current tilt.
      const g = 9.81;
      const radAngle = (angleRef.current * Math.PI) / 180;
      const acceleration = g * Math.sin(radAngle);

      // Update velocity with acceleration and apply increased friction.
      velocityRef.current = velocityRef.current + acceleration * deltaTime;
      velocityRef.current *= 0.9; // increased friction

      // Update ball position using velocity.
      positionRef.current =
        positionRef.current + velocityRef.current * deltaTime;

      // Bounce off the ends (0 and 1) with energy loss.
      if (positionRef.current < 0) {
        positionRef.current = 0;
        velocityRef.current = -velocityRef.current * 0.5;
      } else if (positionRef.current > 1) {
        positionRef.current = 1;
        velocityRef.current = -velocityRef.current * 0.5;
      }

      setPosition(positionRef.current);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // NEW: Invoke onVolumeChange prop when position changes.
  useEffect(() => {
    if (onVolumeChange) {
      onVolumeChange(position);
    }
  }, [position, onVolumeChange]);

  // Function to "snap" the angle to 0 if nearly horizontal.
  const snapAngle = useCallback(() => {
    let lastSnapTime: number | null = null;
    const springConstant = 5; // Adjust for desired speed
    const animateSnap = (timestamp: number) => {
      if (lastSnapTime === null) {
        lastSnapTime = timestamp;
      }
      const deltaTime = (timestamp - lastSnapTime) / 1000;
      lastSnapTime = timestamp;

      setAngle((prevAngle) => {
        const newAngle = prevAngle - springConstant * prevAngle * deltaTime;
        return Math.abs(newAngle) < 0.1 ? 0 : newAngle;
      });

      if (Math.abs(angleRef.current) > 0.1) {
        requestAnimationFrame(animateSnap);
      }
    };
    requestAnimationFrame(animateSnap);
  }, []);

  // Use vertical dragging (mouse Y) to update the bar's tilt.
  const handleWindowMouseMove = useCallback((e: MouseEvent) => {
    if (dragStartRef.current) {
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      // Flip the sign so that moving upward increases the angle.
      let newAngle = dragStartRef.current.angle - deltaY * 0.3;
      newAngle = Math.min(Math.max(newAngle, -30), 30);
      setAngle(newAngle);
    }
  }, []);

  const handleWindowMouseUp = useCallback(() => {
    dragging.current = false;
    dragStartRef.current = null;
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);

    // If the bar is nearly horizontal (within ±5°), snap it to 0.
    if (Math.abs(angle) < 5) {
      snapAngle();
    }
  }, [handleWindowMouseMove, angle, snapAngle]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dragging.current = true;
    dragStartRef.current = { mouseY: e.clientY, angle };
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  // Styles (scaled to roughly 1/4 size; black & white theme)
  const containerStyle: React.CSSProperties = {
    userSelect: "none",
    textAlign: "center",
    backgroundColor: "black",
    color: "white",
    width: "200px",
    borderRadius: "10px",
    border: "2px solid white",
    height: "100px",
    position: "relative",
    margin: "0 auto",
  };

  // The bar remains horizontally centered and rotates based on the current tilt.
  const barStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    width: "150px",
    height: "4px",
    backgroundColor: "white",
    transform: `translateX(-50%) rotate(${angle}deg)`,
    transformOrigin: "center",
    cursor: "grab",
  };

  // The ball’s left position is computed from its normalized value.
  const ballStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: `${position * 100}%`,
    transform: "translate(-50%, -50%)",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "white",
  };

  return (
    <div style={containerStyle}>
      <div ref={barRef} style={barStyle} onMouseDown={handleMouseDown}>
        <div style={ballStyle}></div>
      </div>
      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        BGM Volume: {Math.round(position * 100)}%
      </div>
    </div>
  );
};

export default VolumeAdjuster;
