import React from "react";

interface RedBarsProps {
  barsOffset: number;
  side: "left" | "right";
}

const NUM_BARS = 8;
const BASE_POSITIONS = Array.from(
  { length: NUM_BARS },
  (_, i) => i * (100 / NUM_BARS)
);
const SPEED_MULTIPLIERS = Array.from({ length: NUM_BARS }, () => 1);

const RedBars: React.FC<RedBarsProps> = ({ barsOffset, side }) => {
  const renderScrollingBars = () =>
    [0, 1].map((rep) =>
      Array.from({ length: NUM_BARS }).map((_, i) => {
        const basePos = BASE_POSITIONS[i];
        const speed = SPEED_MULTIPLIERS[i];
        const rawPos = basePos + barsOffset * speed;
        const wrappedPos = ((rawPos % 100) + 100) % 100;
        const justWrapped = rawPos - wrappedPos > 50;
        return (
          <div
            key={`scroll-${side}-${rep}-${i}`}
            className={`red-bar ${justWrapped ? "no-animation" : ""}`}
            style={{ top: `${wrappedPos}%` }}
          />
        );
      })
    );

  const renderStaticBars = (positions: number[], keyPrefix: string) =>
    positions.map((pos, i) => (
      <div
        key={`${keyPrefix}-${i}`}
        className="red-bar static"
        style={{ top: `${pos}%` }}
      />
    ));

  return (
    <>
      {renderScrollingBars()}
      {renderStaticBars([2, 8], `static-top-${side}`)}
      {renderStaticBars([92, 98], `static-bottom-${side}`)}
    </>
  );
};

export default RedBars;
