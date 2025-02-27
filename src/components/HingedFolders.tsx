import React, { useState, useEffect, useMemo, useRef } from "react";
import "./HingedFolders.css";
import flipSoundSrc from "../assets/sounds/hinge_flip.mp3";
import CustomAlert from "./MDR/CustomAlert";

export interface Folder {
  id: number;
  name: string;
}

const severance_folders = [
  { id: 1, name: "Cold Harbor" },
  { id: 2, name: "Bellingham" },
  { id: 3, name: "Allentown" },
  { id: 4, name: "Cairns" },
  { id: 5, name: "Coleman" },
  { id: 6, name: "Culpepper" },
  { id: 7, name: "Dranesville" },
  { id: 8, name: "Yakima" },
  { id: 9, name: "Cielo" },
  { id: 10, name: "Sunset Park" },
  { id: 11, name: "Tumwater" },
  { id: 12, name: "Jesup" },
  { id: 13, name: "Kingsport" },
  { id: 14, name: "Labrador" },
  { id: 15, name: "Le Mars" },
  { id: 16, name: "Longbranch" },
  { id: 17, name: "Minsk" },
  { id: 18, name: "Moonbeam" },
  { id: 19, name: "Nanning" },
  { id: 20, name: "Narva" },
  { id: 21, name: "Ocula" },
  { id: 22, name: "Pacoima" },
  { id: 23, name: "Siena" },
  { id: 24, name: "Astoria" },
  { id: 25, name: "Chicxulub" },
  { id: 26, name: "Eminence" },
  { id: 27, name: "Tan An" },
  { id: 28, name: "Santa Mira" },
  { id: 29, name: "Waynesboro" },
];

// Constants for the scrolling bars remain unchanged.
const NUM_BARS = 8;
const BASE_POSITIONS = Array.from(
  { length: NUM_BARS },
  (_, i) => i * (100 / NUM_BARS)
);
const SPEED_MULTIPLIERS = Array.from({ length: NUM_BARS }, () => 1);
const SCROLL_MULTIPLIER = 0.1;

// Define an interface for bottom tabs.
interface BottomTab {
  letter: string;
  index: number;
  lifetime: number; // How many flips/scrolls remain before removal
}

// Define the props for our component.
interface HingedFoldersProps {
  folders?: Folder[];
  onFolderSelect?: (folderName: string) => void;
}

const playFlipSound = () => {
  const flipSound = new Audio(flipSoundSrc);
  flipSound.volume = 0.1; // Adjust volume
  flipSound.play().catch(() => {}); // Play sound, ignore errors
};

const HingedFolders: React.FC<HingedFoldersProps> = ({
  folders = severance_folders,
  onFolderSelect,
}) => {
  // Sort the folders alphabetically by name before any processing.
  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name));
  }, [folders]);

  // currentIndex is the index of the folder shown on the top card.
  const [currentIndex, setCurrentIndex] = useState(0);
  // isFlipping tells whether the top card is currently animating.
  const [isFlipping, setIsFlipping] = useState(false);
  // removedTabs is used for the top tabs.
  const [removedTabs, setRemovedTabs] = useState<Set<string>>(new Set());
  // barsOffset is used for the side-bars parallax effect.
  const [barsOffset, setBarsOffset] = useState(0);
  // bottomTabs holds our bottom‑letter‑tabs that will persist for 3 flips.
  const [bottomTabs, setBottomTabs] = useState<BottomTab[]>([]);
  // New state for alert message.
  const [alertMessage, setAlertMessage] = useState<string>("");

  const nextIndex = (currentIndex + 1) % sortedFolders.length;
  const currentFolder = sortedFolders[currentIndex].name;
  const nextFolder = sortedFolders[nextIndex].name;

  // Map each letter to its first occurrence index.
  const firstOccurrenceMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedFolders.forEach((folder, index) => {
      const letter = folder.name[0].toUpperCase();
      if (!map.has(letter)) {
        map.set(letter, index);
      }
    });
    return map;
  }, [sortedFolders]);

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
    const available = letterTabs.filter(
      ({ letter }) => !removedTabs.has(letter)
    );
    const sortedByDistance = [...available].sort(
      (a, b) =>
        Math.abs(currentIndex - a.index) - Math.abs(currentIndex - b.index)
    );
    const top3 = sortedByDistance.slice(0, 3);
    return top3.sort((a, b) => a.index - b.index);
  }, [letterTabs, removedTabs, currentIndex]);

  // Listen for wheel events to trigger a flip and update the side bars.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If the user scrolls upward (deltaY <= 0), show custom alert.
      if (e.deltaY <= 0) {
        e.preventDefault();
        if (!alertMessage) {
          setAlertMessage("Please only scroll downwards");
          setTimeout(() => setAlertMessage(""), 2000);
        }
        return;
      }
      e.preventDefault();

      // If not already flipping, trigger the flip.
      if (!isFlipping) {
        const letter = currentFolder[0].toUpperCase();
        playFlipSound(); // Play flip sound on scroll
        // If this folder is the first occurrence for its letter, update removedTabs.
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
  }, [
    isFlipping,
    currentIndex,
    currentFolder,
    firstOccurrenceMap,
    alertMessage,
  ]);

  // When the flip animation ends, update currentIndex and update the bottom tabs.
  const handleAnimationEnd = () => {
    // Update our bottomTabs: decrement each tab’s lifetime and remove any expired tabs.
    setBottomTabs((prevTabs) => {
      const updatedTabs = prevTabs
        .map((tab) => ({ ...tab, lifetime: tab.lifetime - 1 }))
        .filter((tab) => tab.lifetime > 0);

      // If the folder that just flipped is a first occurrence, add a new bottom tab.
      const currentLetter = sortedFolders[currentIndex].name[0].toUpperCase();
      if (firstOccurrenceMap.get(currentLetter) === currentIndex) {
        updatedTabs.push({
          letter: currentLetter,
          index: currentIndex,
          lifetime: 4,
        });
      }

      // Ensure we show at most 3 bottom tabs.
      if (updatedTabs.length > 3) {
        updatedTabs.sort((a, b) => a.index - b.index);
        return updatedTabs.slice(-3);
      }
      return updatedTabs;
    });

    if (currentIndex === sortedFolders.length - 1) {
      setRemovedTabs(new Set());
    }
    setCurrentIndex(nextIndex);
    setIsFlipping(false);
  };

  return (
    <div className="hinge-wrapper">
      <div className="scene">
        {/* Render the top letter tabs */}
        {visibleLetterTabs.map(({ letter, index }) => {
          const distance = Math.abs(currentIndex - index);
          const baseLightness = 88;
          const decrement = 4; // percentage points per distance
          const lightness = Math.max(baseLightness - distance * decrement, 20);
          const backgroundColor = `hsl(195, 77%, ${lightness}%)`;
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
              }}>
              {letter}
            </div>
          );
        })}

        {/* Render the bottom letter tabs (up to 3) */}
        {bottomTabs.map((tab) => {
          const distance = 4 - tab.lifetime;
          const borderBrightness = Math.max(150, 255 - distance * 30);
          const borderColor = `rgb(${borderBrightness}, ${borderBrightness}, ${borderBrightness})`;
          const zIndex = 100 - distance;
          return (
            <div
              key={tab.letter}
              className="bottom-letter-tab bottom-tab"
              style={{
                left: `calc(50% - 100px + ${folderTabOffsets.get(
                  tab.index
                )}px)`,
                backgroundColor: "#000", // Always black
                border: `2px solid ${borderColor}`, // Fading border
                zIndex,
                marginBottom: distance * 1.3,
              }}
            />
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
          onClick={() => {
            if (!isFlipping && onFolderSelect) {
              onFolderSelect(currentFolder);
            }
          }}>
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

        {/* The bottom card */}
        <div className="card bottom-card">
          <div className="card-face front" />
          <div className="card-face back" />
        </div>

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
      {/* Render the custom alert if alertMessage is set */}
      {alertMessage && <CustomAlert message={alertMessage} />}
    </div>
  );
};

export default HingedFolders;
