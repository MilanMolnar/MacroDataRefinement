import React from "react";

interface BackwardFlipCardProps {
  folderName: string;
  flipDuration: number;
  onAnimationEnd: () => void;
}

const BackwardFlipCard: React.FC<BackwardFlipCardProps> = ({
  folderName,
  flipDuration,
  onAnimationEnd,
}) => {
  const dynamicStyle = {
    "--flip-duration": `${flipDuration}s`,
  } as React.CSSProperties;

  return (
    <div
      className="card backward-flip-card"
      style={dynamicStyle}
      onAnimationEnd={onAnimationEnd}>
      <div className="card-face front">
        <span className="card-text">{folderName}</span>
      </div>
      <div className="card-face back" />
    </div>
  );
};

export default BackwardFlipCard;
