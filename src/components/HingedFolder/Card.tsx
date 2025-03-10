import React from "react";

interface CardProps {
  currentFolder: string;
  isFlipping: boolean;
  flipDuration: number;
  firstOccurrenceMap: Map<string, number>;
  folderTabOffsets: Map<number, number>;
  currentIndex: number;
  onClick: () => void;
  onAnimationEnd: () => void;
}

const Card: React.FC<CardProps> = ({
  currentFolder,
  isFlipping,
  flipDuration,
  firstOccurrenceMap,
  folderTabOffsets,
  currentIndex,
  onClick,
  onAnimationEnd,
}) => {
  const dynamicStyle: React.CSSProperties = isFlipping
    ? ({ "--flip-duration": `${flipDuration}s` } as React.CSSProperties)
    : {};
  return (
    <div
      className={`card top-card ${isFlipping ? "flip-forward" : ""}`}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      style={dynamicStyle}>
      <div className="card-face front">
        <span className="card-text">{currentFolder}</span>
        {firstOccurrenceMap.get(currentFolder[0].toUpperCase()) ===
          currentIndex && (
          <div
            className="folder-tab top-tab"
            style={{ left: folderTabOffsets.get(currentIndex) + "px" }}>
            {currentFolder[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="card-face back" />
    </div>
  );
};

export default Card;
