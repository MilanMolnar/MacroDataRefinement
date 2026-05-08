import React, { useState, useEffect, useMemo } from "react";
import "./HingedFolders.css";
import flipSoundSrc from "../../assets/sounds/hinge_flip.mp3";
import severanceFolders from "./Folders";
import LetterTabs from "./LetterTabs";
import HingeBars from "./HingeBars";
import Card from "./Card";
import BottomCard from "./BottomCard";
import BackwardFlipCard from "./BackwardFlipCard";

export interface Folder {
  id: number;
  name: string;
}

const SCROLL_MULTIPLIER = 0.1;

interface BottomTab {
  letter: string;
  index: number;
  lifetime: number;
}

interface HingedFoldersProps {
  folders?: Folder[];
  onFolderSelect?: (folderName: string) => void;
}

const playFlipSound = () => {
  const flipSound = new Audio(flipSoundSrc);
  flipSound.volume = 0.1;
  flipSound.play().catch(() => {});
};

const HingedFolders: React.FC<HingedFoldersProps> = ({
  folders = severanceFolders,
  onFolderSelect,
}) => {
  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [removedTabs, setRemovedTabs] = useState<Set<string>>(new Set());
  const [barsOffset, setBarsOffset] = useState(0);
  const [bottomTabs, setBottomTabs] = useState<BottomTab[]>([]);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward");

  const nextIndex = (currentIndex + 1) % sortedFolders.length;
  const prevIndex = (currentIndex - 1 + sortedFolders.length) % sortedFolders.length;
  const currentFolder = sortedFolders[currentIndex].name;
  const nextFolder = sortedFolders[nextIndex].name;
  const prevFolder = sortedFolders[prevIndex].name;

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

  const folderTabOffsets = useMemo(() => {
    const offsets = new Map<number, number>();
    firstOccurrenceMap.forEach((index) => {
      offsets.set(index, Math.floor(Math.random() * 120) + 10);
    });
    return offsets;
  }, [firstOccurrenceMap]);

  const letterTabs = useMemo(() => {
    return Array.from(firstOccurrenceMap.entries())
      .map(([letter, index]) => ({ letter, index }))
      .sort((a, b) => a.index - b.index);
  }, [firstOccurrenceMap]);

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

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        // Scroll up — flip backward
        if (!isFlipping) {
          playFlipSound();
          setFlipDirection("backward");
          setIsFlipping(true);
        }
        const MAX_DELTA = 50;
        const clampedDelta = Math.min(-e.deltaY, MAX_DELTA);
        setBarsOffset((prev) => prev - clampedDelta * SCROLL_MULTIPLIER);
        return;
      }

      if (e.deltaY > 0) {
        // Scroll down — flip forward
        if (!isFlipping) {
          const letter = currentFolder[0].toUpperCase();
          playFlipSound();
          if (firstOccurrenceMap.get(letter) === currentIndex) {
            setRemovedTabs((prev) => new Set(prev).add(letter));
          }
          setFlipDirection("forward");
          setIsFlipping(true);
        }
        const MAX_DELTA = 50;
        const clampedDelta = Math.min(e.deltaY, MAX_DELTA);
        setBarsOffset((prev) => prev + clampedDelta * SCROLL_MULTIPLIER);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [
    isFlipping,
    currentIndex,
    currentFolder,
    firstOccurrenceMap,
  ]);

  const flipDuration = 0.2;

  const handleAnimationEnd = () => {
    // === BACKWARD FLIP ===
    if (flipDirection === "backward") {
      const newIndex = (currentIndex - 1 + sortedFolders.length) % sortedFolders.length;

      // Restore the letter tab for the folder being revealed
      const newLetter = sortedFolders[newIndex].name[0].toUpperCase();
      if (firstOccurrenceMap.get(newLetter) === newIndex) {
        setRemovedTabs((prev) => {
          const updated = new Set(prev);
          updated.delete(newLetter);
          return updated;
        });
      }

      // Decrement bottom tab lifetimes (no new additions going backward)
      setBottomTabs((prevTabs) =>
        prevTabs
          .map((tab) => ({ ...tab, lifetime: tab.lifetime - 1 }))
          .filter((tab) => tab.lifetime > 0)
      );

      setCurrentIndex(newIndex);
      setIsFlipping(false);
      return;
    }

    // === FORWARD FLIP ===
    setBottomTabs((prevTabs) => {
      const updatedTabs = prevTabs
        .map((tab) => ({ ...tab, lifetime: tab.lifetime - 1 }))
        .filter((tab) => tab.lifetime > 0);
      const currentLetter = sortedFolders[currentIndex].name[0].toUpperCase();
      if (firstOccurrenceMap.get(currentLetter) === currentIndex) {
        updatedTabs.push({
          letter: currentLetter,
          index: currentIndex,
          lifetime: 4,
        });
      }
      if (updatedTabs.length > 3) {
        updatedTabs.sort((a, b) => a.index - b.index);
        return updatedTabs.slice(-3);
      }
      return updatedTabs;
    });

    if (currentIndex === sortedFolders.length - 1) {
      setRemovedTabs(new Set());
    }

    const newIndex = (currentIndex + 1) % sortedFolders.length;
    setCurrentIndex(newIndex);
    setIsFlipping(false);
  };

  return (
    <div className="hinge-wrapper">
      <div className="scene">
        <LetterTabs
          visibleTabs={visibleLetterTabs}
          folderTabOffsets={folderTabOffsets}
          currentIndex={currentIndex}
        />
        <div className="background-folder">
          <span className="card-text">{nextFolder}</span>
        </div>
        <Card
          currentFolder={flipDirection === "backward" && isFlipping ? prevFolder : currentFolder}
          isFlipping={flipDirection === "forward" && isFlipping}
          flipDuration={flipDuration}
          firstOccurrenceMap={firstOccurrenceMap}
          folderTabOffsets={folderTabOffsets}
          currentIndex={flipDirection === "backward" && isFlipping ? prevIndex : currentIndex}
          onClick={() => {
            if (!isFlipping && onFolderSelect) onFolderSelect(currentFolder);
          }}
          onAnimationEnd={handleAnimationEnd}
        />
        {flipDirection === "backward" && isFlipping && (
          <BackwardFlipCard
            folderName={prevFolder}
            flipDuration={flipDuration}
            onAnimationEnd={handleAnimationEnd}
          />
        )}
        <BottomCard />
        <HingeBars barsOffset={barsOffset} />
        {bottomTabs.map((tab) => {
          const distanceForTab = Math.abs(currentIndex - tab.index);
          const baseLightness = 88;
          const decrement = 4;
          const borderLightness = Math.max(
            baseLightness - distanceForTab * decrement,
            20
          );
          const borderColor = `hsl(195, 77%, ${borderLightness}%)`;
          const distance = 4 - tab.lifetime;
          const zIndex = 99 - distance;
          return (
            <div
              key={tab.letter}
              className="bottom-letter-tab bottom-tab"
              style={{
                left: `calc(50% - 100px + ${folderTabOffsets.get(
                  tab.index
                )}px)`,
                backgroundColor: "#000",
                border: `2px solid ${borderColor}`,
                zIndex,
                marginBottom: distance * 1.5,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HingedFolders;
