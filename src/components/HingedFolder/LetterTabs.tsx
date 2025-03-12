import React from "react";

interface LetterTabsProps {
  visibleTabs: { letter: string; index: number }[];
  folderTabOffsets: Map<number, number>;
  currentIndex: number;
}

const LetterTabs: React.FC<LetterTabsProps> = ({
  visibleTabs,
  folderTabOffsets,
  currentIndex,
}) => {
  return (
    <>
      {visibleTabs.map(({ letter, index }) => {
        const distance = Math.abs(currentIndex - index);
        const baseLightness = 88;
        const decrement = 4;
        const lightness = Math.max(baseLightness - distance * decrement, 20);
        const backgroundColor = `hsl(195, 77%, ${lightness}%)`;
        return (
          <div
            key={letter}
            className="folder-tab top-letter-tab"
            style={{
              left: `calc(50% - 100px + ${folderTabOffsets.get(index)}px)`,
              backgroundColor,
              zIndex: 10 - distance,
              marginTop: distance * 1.3,
            }}>
            {letter}
          </div>
        );
      })}
    </>
  );
};

export default LetterTabs;
