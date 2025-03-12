// src/components/HingeBars.tsx
import React from "react";
import RedBars from "./RedBars";

interface HingeBarsProps {
  barsOffset: number;
}

const HingeBars: React.FC<HingeBarsProps> = ({ barsOffset }) => (
  <>
    <div className="hinge-bar hinge-left" />
    <div className="hinge-bar hinge-right" />
    <div className="side-bars-container">
      <div className="side-bars side-bars-left">
        <RedBars barsOffset={barsOffset} side="left" />
      </div>
      <div className="side-bars side-bars-right">
        <RedBars barsOffset={barsOffset} side="right" />
      </div>
    </div>
  </>
);

export default HingeBars;
