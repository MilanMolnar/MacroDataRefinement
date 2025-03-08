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

const NUM_BARS = 8;
const BASE_POSITIONS = Array.from(
  { length: NUM_BARS },
  (_, i) => i * (100 / NUM_BARS)
);
const SPEED_MULTIPLIERS = Array.from({ length: NUM_BARS }, () => 1);
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
  folders = severance_folders,
  onFolderSelect,
}) => {
  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name));
  }, [folders]);

  // State declarations
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [removedTabs, setRemovedTabs] = useState<Set<string>>(new Set());
  const [barsOffset, setBarsOffset] = useState(0);
  const [bottomTabs, setBottomTabs] = useState<BottomTab[]>([]);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "SYSTEM: Macro data refinement files successfully loaded",
  ]);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [autoFlipCount, setAutoFlipCount] = useState(0);
  const [autoFlipTotal, setAutoFlipTotal] = useState(0);
  // authorizedFolder holds the folder name that the user is allowed to access.
  const [authorizedFolder, setAuthorizedFolder] = useState<string>("");

  const terminalHistoryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal history to bottom
  useEffect(() => {
    if (terminalHistoryRef.current) {
      terminalHistoryRef.current.scrollTop =
        terminalHistoryRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const nextIndex = (currentIndex + 1) % sortedFolders.length;
  const currentFolder = sortedFolders[currentIndex].name;
  const nextFolder = sortedFolders[nextIndex].name;

  // Map for first occurrence of each starting letter.
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

  // Random horizontal offsets for tabs.
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

  // Listen for wheel events (ignored during auto‑flip)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (targetIndex !== null) return;
      if (e.deltaY <= 0) {
        e.preventDefault();
        if (!alertMessage) {
          setAlertMessage("Please only scroll downwards");
          setTimeout(() => setAlertMessage(""), 2000);
        }
        return;
      }
      e.preventDefault();

      if (!isFlipping) {
        const letter = currentFolder[0].toUpperCase();
        playFlipSound();
        if (firstOccurrenceMap.get(letter) === currentIndex) {
          setRemovedTabs((prev) => new Set(prev).add(letter));
        }
        setIsFlipping(true);
      }
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
    targetIndex,
  ]);

  // When auto-flip is active, continuously update side bars to simulate scrolling.
  useEffect(() => {
    if (targetIndex !== null) {
      const intervalId = setInterval(() => {
        setBarsOffset((prev) => prev + 5);
      }, 30);
      return () => clearInterval(intervalId);
    }
  }, [targetIndex]);

  // Compute flip animation duration dynamically.
  const flipDuration =
    targetIndex !== null && autoFlipTotal > 0
      ? autoFlipCount === 0 || autoFlipCount === autoFlipTotal - 1
        ? 0.2
        : 0.1
      : 0.2;

  // Triggered at the end of each flip animation.
  const handleAnimationEnd = () => {
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

    if (targetIndex !== null && newIndex !== targetIndex) {
      let delay = 40;
      if (autoFlipTotal > 2) {
        const t = autoFlipCount / (autoFlipTotal - 1);
        delay = 10 + 90 * Math.pow(2 * t - 1, 2);
      }
      const baseMin = 5,
        baseMax = 100;
      const tProgress =
        autoFlipTotal > 1 ? autoFlipCount / (autoFlipTotal - 1) : 0;
      const offsetIncrement =
        baseMin + (baseMax - baseMin) * (1 - Math.pow(2 * tProgress - 1, 2));
      setBarsOffset((prev) => prev + offsetIncrement);

      setTimeout(() => {
        const folderLetter = sortedFolders[newIndex].name[0].toUpperCase();
        if (firstOccurrenceMap.get(folderLetter) === newIndex) {
          setRemovedTabs((prev) => new Set(prev).add(folderLetter));
        }
        playFlipSound();
        setIsFlipping(true);
      }, delay);
      setAutoFlipCount((prevCount) => prevCount + 1);
    } else {
      if (authorizedFolder) {
        setTerminalHistory((prev) => [
          ...prev,
          `RESULT: File "${authorizedFolder}" loaded successfully.`,
        ]);
      }
      setTargetIndex(null);
      setAutoFlipCount(0);
      setAutoFlipTotal(0);
      // Do not clear authorizedFolder.
    }
  };

  // Enhanced command parsing for terminal input.
  const handleTerminalSubmit = () => {
    const input = terminalInput.trim();
    if (!input) return;

    // Command: cd <folder>
    if (input.toLowerCase().startsWith("cd ")) {
      const folderName = input.substring(3).trim();
      // If no authorized folder is set, try to set it from input.
      let auth = authorizedFolder;
      if (!auth) {
        const foundIndex = sortedFolders.findIndex(
          (folder) => folder.name.toLowerCase() === folderName.toLowerCase()
        );
        if (foundIndex !== -1) {
          auth = sortedFolders[foundIndex].name;
          setAuthorizedFolder(auth);
        }
      }
      if (auth && folderName.toLowerCase() === auth.toLowerCase()) {
        // Immediately open the folder without flipping.
        setTerminalHistory((prev) => [
          ...prev,
          `QUERY: Changing directory to "${folderName}"...`,
          `RESULT: Opening "${folderName}"...`,
        ]);
        if (onFolderSelect) onFolderSelect(folderName);
      } else {
        setTerminalHistory((prev) => [
          ...prev,
          `QUERY: ${input}`,
          `RESULT: Unauthorized.`,
        ]);
      }
      setTerminalInput("");
      return;
    }

    // Command: open
    if (input.toLowerCase() === "open") {
      if (
        authorizedFolder &&
        currentFolder.toLowerCase() === authorizedFolder.toLowerCase()
      ) {
        setTerminalHistory((prev) => [
          ...prev,
          `QUERY: open`,
          `RESULT: Opening "${currentFolder}"...`,
        ]);
        if (onFolderSelect) onFolderSelect(currentFolder);
      } else {
        setTerminalHistory((prev) => [
          ...prev,
          `QUERY: open`,
          `RESULT: Unauthorized.`,
        ]);
      }
      setTerminalInput("");
      return;
    }

    // Standard folder search.
    const foundIndex = sortedFolders.findIndex(
      (folder) => folder.name.toLowerCase() === input.toLowerCase()
    );
    if (foundIndex === -1) {
      setTerminalHistory((prev) => [
        ...prev,
        `QUERY: Searching for "${input}"...`,
        `RESULT: File "${input}" was not found.`,
      ]);
      setTerminalInput("");
      return;
    }
    if (foundIndex === currentIndex) {
      setTerminalHistory((prev) => [
        ...prev,
        `QUERY: Searching for "${input}"...`,
        `RESULT: File "${input}" is already open.`,
      ]);
      setTerminalInput("");
      return;
    }
    // Standard folder search: calculate flips needed.
    const steps =
      (foundIndex - currentIndex + sortedFolders.length) % sortedFolders.length;
    setAutoFlipTotal(steps);
    setAutoFlipCount(0);
    setTargetIndex(foundIndex);
    setAuthorizedFolder(sortedFolders[foundIndex].name);
    setTerminalHistory((prev) => [
      ...prev,
      `QUERY: Searching for "${input}"...`,
    ]);
    if (!isFlipping) {
      playFlipSound();
      setIsFlipping(true);
    }
    setTerminalInput("");
  };

  return (
    <div className="hinge-wrapper">
      <div className="scene">
        {visibleLetterTabs.map(({ letter, index }) => {
          const distance = Math.abs(currentIndex - index);
          const baseLightness = 88;
          const decrement = 4;
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
          const zIndex = 100 - distance;
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
                marginBottom: distance * 1.3,
              }}
            />
          );
        })}
        <div className="background-folder">
          <span className="card-text">{nextFolder}</span>
        </div>
        <div
          className={`card top-card ${isFlipping ? "flip-forward" : ""}`}
          onAnimationEnd={handleAnimationEnd}
          onClick={() => {
            if (!isFlipping && onFolderSelect) {
              onFolderSelect(currentFolder);
            }
          }}
          style={
            isFlipping
              ? ({
                  "--flip-duration": `${flipDuration}s`,
                } as React.CSSProperties)
              : {}
          }>
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
        <div className="card bottom-card">
          <div className="card-face front" />
          <div className="card-face back" />
        </div>
        <div className="hinge-bar hinge-left" />
        <div className="hinge-bar hinge-right" />
        <div className="side-bars-container">
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
      <div className="terminal-container">
        <div className="terminal-history" ref={terminalHistoryRef}>
          {terminalHistory.map((line, index) => (
            <div key={index} className="terminal-line">
              {line}
            </div>
          ))}
        </div>
        <input
          type="text"
          className="terminal-input"
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleTerminalSubmit();
            }
          }}
          placeholder="> "
        />
      </div>
      {alertMessage && <CustomAlert message={alertMessage} />}
    </div>
  );
};

export default HingedFolders;
