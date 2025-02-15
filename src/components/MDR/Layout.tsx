import React, { useMemo, useState, useRef, useEffect } from 'react';
import Header from './Header';
import Grid from './Grid';
import FooterBar from './FooterBar';
import FooterText from './FooterText';
import AnimationStyles from './AnimationStyles';
import { ShapeType } from './shapeDefinitions';
import FlyToBoxOverlay, { FlyDigit } from './FlyToBoxOverlay';

interface SeveranceMDRLayoutProps {
  headerText: string;
  percentage: string;
  logoUrl?: string;
}

const SeveranceMDRLayout: React.FC<SeveranceMDRLayoutProps> = ({
  headerText,
  percentage,
  logoUrl,
}) => {
  const containerWidth = 1220;
  const containerHeight = 720;
  const headerHeight = 40;
  const gridHeight = containerHeight - headerHeight - 100;
  const rows = 15;
  const cols = 38;
  const cellWidth = 24;
  const cellHeight = 32;
  const rowGap = 8;
  const colGap = 8;
  const lineStyle: React.CSSProperties = {
    margin: 0,
    border: '1px solid white',
  };

  // Footer progress state.
  const [footerProgress, setFooterProgress] = useState<Record<ShapeType, number>>({
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
    const completeCount = Object.values(footerProgress).filter(val => val === 100).length;
    return completeCount * 20;
  }, [footerProgress]);

  // --- NEW: Alert "gg" if header is 100% and all boxes are closed ---
  const alertedGG = useRef(false);
  useEffect(() => {
    if (headerPercentage === 100 && openFooterBox === null && !alertedGG.current) {
      alertedGG.current = true;
      const timer = setTimeout(() => {
        alert("gg");
      }, 1500); // Wait 1 second before alerting
      return () => clearTimeout(timer);
    }
  }, [headerPercentage, openFooterBox]);
  // --------------------------------------------------------------------

  // Determine the bounding rect of the currently open footer box.
  const [targetFooterBoxRect, setTargetFooterBoxRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (openFooterBox !== null && footerBoxRefs.current[openFooterBox - 1]) {
      const rect = footerBoxRefs.current[openFooterBox - 1]!.getBoundingClientRect();
      setTargetFooterBoxRect(rect);
    }
  }, [openFooterBox]);

  // Track which shape just completed so that its cells can refresh.
  const [completedShapeId, setCompletedShapeId] = useState<number | null>(null);

  // Called when a shape’s fly animation starts.
  const handleAnimationStart = (digits: FlyDigit[], shapeId: number) => {
    setFlyDigits(digits);
    setAnimatingShapeId(shapeId);
  };

  // Called when the fly animation ends.
  const handleAnimationEnd = () => {
    // Set the completed shape so that Grid refreshes only its cells.
    setCompletedShapeId(animatingShapeId);
    setFlyDigits([]);
    setAnimatingShapeId(null);
  };

  return (
    <>
      <AnimationStyles />
      <div
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          backgroundColor: 'black',
          color: 'white',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          animation: 'fadeIn 1s ease-out forwards',
        }}
      >
        <Header headerText={headerText} percentage={headerPercentage} logoUrl={logoUrl} />
        <hr style={lineStyle} />
        <hr style={lineStyle} />
        <Grid
          containerWidth={containerWidth}
          containerHeight={gridHeight}
          rows={rows}
          cols={cols}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          rowGap={rowGap}
          colGap={colGap}
          onShapeCompleted={(shapeType: ShapeType) =>
            setFooterProgress(prev => ({ ...prev, [shapeType]: 100 }))
          }
          openFooterBox={openFooterBox}
          targetFooterBoxRect={targetFooterBoxRect}
          onAnimationStart={handleAnimationStart}
          refreshCompletedShapeId={completedShapeId}
          onShapeRefreshed={() => setCompletedShapeId(null)}
        />
        <hr style={lineStyle} />
        <hr style={lineStyle} />
        <div style={{ position: 'relative', zIndex: 11000 }}>
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
        <FlyToBoxOverlay flyDigits={flyDigits} onAnimationEnd={handleAnimationEnd} />
      )}
    </>
  );
};

export default SeveranceMDRLayout;
