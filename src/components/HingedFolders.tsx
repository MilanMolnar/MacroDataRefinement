import React, { useState, useEffect, useMemo } from "react";
import "./HingedFolders.css";

interface Folder {
  id: number;
  name: string;
}

const folderData: Folder[] = [
  { id: 1, name: "AFldr1" },
  { id: 2, name: "AFldr2" },
  { id: 3, name: "AFldr3" },
  { id: 4, name: "BFldr1" },
  { id: 5, name: "BFldr2" },
  { id: 6, name: "BFldr3" },
  { id: 7, name: "BFldr4" },
  { id: 8, name: "CFldr1" },
  { id: 9, name: "DFldr1" },
  { id: 10, name: "DFldr2" },
  { id: 11, name: "DFldr3" },
  { id: 12, name: "EFldr1" },
  { id: 13, name: "EFldr2" },
  { id: 14, name: "EFldr3" },
  { id: 15, name: "EFldr4" },
  { id: 16, name: "EFldr5" },
  { id: 17, name: "FFldr1" },
  { id: 18, name: "FFldr2" },
  { id: 19, name: "GFldr1" },
  { id: 20, name: "GFldr2" },
  { id: 21, name: "GFldr3" },
  { id: 22, name: "GFldr4" },
  { id: 23, name: "HFldr1" },
  { id: 24, name: "IFldr1" },
  { id: 25, name: "IFldr2" },
  { id: 26, name: "IFldr3" },
  { id: 27, name: "IFldr4" },
  { id: 28, name: "IFldr5" },
  { id: 29, name: "JFldr1" },
  { id: 30, name: "JFldr2" },
  { id: 31, name: "KFldr1" },
  { id: 32, name: "KFldr2" },
  { id: 33, name: "KFldr3" },
  { id: 34, name: "KFldr4" },
  { id: 35, name: "LFldr1" },
  { id: 36, name: "LFldr2" },
  { id: 37, name: "MFldr1" },
  { id: 38, name: "MFldr2" },
  { id: 39, name: "MFldr3" },
  { id: 40, name: "NFldr1" },
  { id: 41, name: "NFldr2" },
  { id: 42, name: "OFldr1" },
  { id: 43, name: "PFldr1" },
  { id: 44, name: "PFldr2" },
  { id: 45, name: "PFldr3" },
  { id: 46, name: "PFldr4" },
  { id: 47, name: "QFldr1" },
  { id: 48, name: "RFldr1" },
  { id: 49, name: "RFldr2" },
  { id: 50, name: "R_END" },
];

// Constants for the scrolling bars remain unchanged.
const NUM_BARS = 8;
const BASE_POSITIONS = Array.from({ length: NUM_BARS }, (_, i) => i * (100 / NUM_BARS));
const SPEED_MULTIPLIERS = Array.from({ length: NUM_BARS }, () => 1);
const SCROLL_MULTIPLIER = 0.1;

// Define an interface for bottom tabs.
interface BottomTab {
  letter: string;
  index: number;
  lifetime: number; // How many flips/scrolls remain before removal
}

const HingedFolders: React.FC = () => {
  // currentIndex is the index of the folder shown on the top card.
  const [currentIndex, setCurrentIndex] = useState(0);
  // isFlipping tells whether the top card is currently animating.
  const [isFlipping, setIsFlipping] = useState(false);
  // removedTabs is used for the top tabs (unchanged from your code).
  const [removedTabs, setRemovedTabs] = useState<Set<string>>(new Set());
  // barsOffset is used for the side-bars parallax effect.
  const [barsOffset, setBarsOffset] = useState(0);
  // NEW: bottomTabs holds our bottom‑letter‑tabs that will persist for 3 flips.
  const [bottomTabs, setBottomTabs] = useState<BottomTab[]>([]);

  const nextIndex = (currentIndex + 1) % folderData.length;
  const currentFolder = folderData[currentIndex].name;
  const nextFolder = folderData[nextIndex].name;

  // Map each letter to its first occurrence index.
  const firstOccurrenceMap = useMemo(() => {
    const map = new Map<string, number>();
    folderData.forEach((folder, index) => {
      const letter = folder.name[0].toUpperCase();
      if (!map.has(letter)) {
        map.set(letter, index);
      }
    });
    return map;
  }, []);

  // Each unique letter gets a random horizontal offset.
  const folderTabOffsets = useMemo(() => {
    const offsets = new Map<number, number>();
    firstOccurrenceMap.forEach((index) => {
      offsets.set(index, Math.floor(Math.random() * 120) + 10);
    });
    return offsets;
  }, [firstOccurrenceMap]);

  // Compute the array of unique top-letter tabs.
  const letterTabs = useMemo(() => {
    return Array.from(firstOccurrenceMap.entries())
      .map(([letter, index]) => ({ letter, index }))
      .sort((a, b) => a.index - b.index);
  }, [firstOccurrenceMap]);

  // Compute which top-letter tabs remain visible (up to 3).
  const visibleLetterTabs = useMemo(() => {
    const available = letterTabs.filter(({ letter }) => !removedTabs.has(letter));
    const sortedByDistance = [...available].sort(
      (a, b) => Math.abs(currentIndex - a.index) - Math.abs(currentIndex - b.index)
    );
    const top3 = sortedByDistance.slice(0, 3);
    return top3.sort((a, b) => a.index - b.index);
  }, [letterTabs, removedTabs, currentIndex]);

  // Listen for wheel events to trigger a flip and update the side bars.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only allow scrolling down.
      if (e.deltaY <= 0) return;
      e.preventDefault();
      
      // If not already flipping, trigger the flip.
      if (!isFlipping) {
        const letter = currentFolder[0].toUpperCase();
        // If this folder is the first occurrence for its letter, update removedTabs
        if (firstOccurrenceMap.get(letter) === currentIndex) {
          setRemovedTabs((prev) => new Set(prev).add(letter));
        }
        setIsFlipping(true);
      }
      
      // Clamp and reverse the scroll for the side-bars.
      const MAX_DELTA = 50;
      const clampedDelta = Math.min(e.deltaY, MAX_DELTA);
      setBarsOffset((prev) => prev + clampedDelta * SCROLL_MULTIPLIER);
    };
  
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isFlipping, currentIndex, currentFolder, firstOccurrenceMap]);

  // MODIFIED: When the flip animation ends, update currentIndex and update the bottom tabs.
  const handleAnimationEnd = () => {
    // Update our bottomTabs: decrement each tab’s lifetime and remove any expired tabs.
    setBottomTabs((prevTabs) => {
      const updatedTabs = prevTabs
        .map((tab) => ({ ...tab, lifetime: tab.lifetime - 1 }))
        .filter((tab) => tab.lifetime > 0);
      
      // If the folder that just flipped is a first occurrence, add a new bottom tab.
      const currentLetter = folderData[currentIndex].name[0].toUpperCase();
      if (firstOccurrenceMap.get(currentLetter) === currentIndex) {
        updatedTabs.push({ letter: currentLetter, index: currentIndex, lifetime: 4 });
      }
      
      // Ensure we show at most 3 bottom tabs.
      if (updatedTabs.length > 3) {
        updatedTabs.sort((a, b) => a.index - b.index);
        return updatedTabs.slice(-3);
      }
      return updatedTabs;
    });
    
    if (currentIndex === folderData.length - 1) {
      setRemovedTabs(new Set());
    }
    setCurrentIndex(nextIndex);
    setIsFlipping(false);
  };

  return (
    <div className="hinge-wrapper">
      <div className="scene">
        {/* Render the top letter tabs as before */}
        {visibleLetterTabs.map(({ letter, index }) => {
          const distance = Math.abs(currentIndex - index);
          const brightness = Math.max(200, 255 - distance * 10);
          const backgroundColor = `rgb(${brightness}, ${brightness}, ${brightness})`;
          const zIndex = 10 - distance;
          return (
            <div
              key={letter}
              className="folder-tab top-letter-tab"
              style={{
                left: `calc(50% - 100px + ${folderTabOffsets.get(index)}px)`,
                backgroundColor,
                zIndex,
                marginTop: distance * 1.3,
              }}
            >
              {letter}
            </div>
          );
        })}

        {/* NEW: Render the bottom letter tabs (up to 3) */}
        {bottomTabs.map((tab) => {
  // We use (3 - lifetime) as a “distance” measure.
  const distance = 4 - tab.lifetime;
  // Compute a border brightness that fades from white to a grayer tone.
  // For a new tab (distance = 0) the border is white (255); for older tabs it gets darker.
  const borderBrightness = Math.max(150, 255 - distance * 30);
  const borderColor = `rgb(${borderBrightness}, ${borderBrightness}, ${borderBrightness})`;
  const zIndex = 100 - distance;
  return (
    <div
      key={tab.letter}
      className="bottom-letter-tab bottom-tab"
      style={{
        left: `calc(50% - 100px + ${folderTabOffsets.get(tab.index)}px)`,
        backgroundColor: "#000", // Always black
        border: `2px solid ${borderColor}`, // Fading border
        zIndex,
        marginBottom: distance * 1.3
      }}
    >
    </div>
  );
})}

        {/* The background folder (with next folder name) */}
        <div className="background-folder">
          <span className="card-text">{nextFolder}</span>
        </div>

        {/* The top flipping card (current folder) */}
        <div
          className={`card top-card ${isFlipping ? "flip-forward" : ""}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="card-face front">
            <span className="card-text">{currentFolder}</span>
            {/* Built‑in top tab if this folder is the first occurrence */}
            {firstOccurrenceMap.get(currentFolder[0].toUpperCase()) === currentIndex && (
              <div
                className="folder-tab top-tab"
                style={{ left: folderTabOffsets.get(currentIndex) + "px" }}
              >
                {currentFolder[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="card-face back" />
        </div>

        {/* The bottom card */}
        <div className="card bottom-card">
          <div className="card-face front" />
          <div className="card-face back" />
        </div>

        {/* (Remove the previous single bottom-tab that used prevFolderIndex) */}

        {/* Hinge bars */}
        <div className="hinge-bar hinge-left" />
        <div className="hinge-bar hinge-right" />

        {/* Side bars container remains unchanged */}
        <div className="side-bars-container">
          {/* Left Side Bars */}
          <div className="side-bars side-bars-left">
            {[0, 1].map((rep) =>
              Array.from({ length: NUM_BARS }).map((_, i) => {
                const basePos = BASE_POSITIONS[i];
                const speed = SPEED_MULTIPLIERS[i];
                const rawPos = basePos + barsOffset * speed;
                const wrappedPos = ((rawPos % 100) + 100) % 100;
                const justWrapped = rawPos - wrappedPos > 50;
                return (
                  <div
                    key={`scroll-left-${rep}-${i}`}
                    className={`red-bar ${justWrapped ? "no-animation" : ""}`}
                    style={{ top: `${wrappedPos}%` }}
                  />
                );
              })
            )}
            {[0, 1].map((_, i) => {
              const topPositions = [2, 8];
              return (
                <div
                  key={`static-top-left-${i}`}
                  className="red-bar static"
                  style={{ top: `${topPositions[i]}%` }}
                />
              );
            })}
            {[0, 1].map((_, i) => {
              const bottomPositions = [92, 98];
              return (
                <div
                  key={`static-bottom-left-${i}`}
                  className="red-bar static"
                  style={{ top: `${bottomPositions[i]}%` }}
                />
              );
            })}
          </div>

          {/* Right Side Bars */}
          <div className="side-bars side-bars-right">
            {[0, 1].map((rep) =>
              Array.from({ length: NUM_BARS }).map((_, i) => {
                const basePos = BASE_POSITIONS[i];
                const speed = SPEED_MULTIPLIERS[i];
                const rawPos = basePos + barsOffset * speed;
                const wrappedPos = ((rawPos % 100) + 100) % 100;
                const justWrapped = rawPos - wrappedPos > 50;
                return (
                  <div
                    key={`scroll-right-${rep}-${i}`}
                    className={`red-bar ${justWrapped ? "no-animation" : ""}`}
                    style={{ top: `${wrappedPos}%` }}
                  />
                );
              })
            )}
            {[0, 1].map((_, i) => {
              const topPositions = [2, 8];
              return (
                <div
                  key={`static-top-right-${i}`}
                  className="red-bar static"
                  style={{ top: `${topPositions[i]}%` }}
                />
              );
            })}
            {[0, 1].map((_, i) => {
              const bottomPositions = [92, 98];
              return (
                <div
                  key={`static-bottom-right-${i}`}
                  className="red-bar static"
                  style={{ top: `${bottomPositions[i]}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HingedFolders;

//TODO: bottom tab should fade out and move up, z index is wrong, adn when appearing it should just fadein fast or no Animation, no letter and top border black and no round so it looks connected to fodler
