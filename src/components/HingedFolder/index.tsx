import React, { useState, useEffect, useMemo, useRef } from "react";
import "./HingedFolders.css";
import flipSoundSrc from "../../assets/sounds/hinge_flip.mp3";
import CustomAlert from "../common/CustomAlert";
import severanceFolders from "./Folders";
import LetterTabs from "./LetterTabs";
import Terminal from "./Terminal";
import HingeBars from "./HingeBars";
import Card from "./Card";
import BottomCard from "./BottomCard";

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
  highlightFolder?: string;
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
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "SYSTEM: Macro data refinement files successfully loaded",
  ]);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [autoFlipCount, setAutoFlipCount] = useState(0);
  const [autoFlipTotal, setAutoFlipTotal] = useState(0);
  const [authorizedFolder, setAuthorizedFolder] = useState<string>("");

  const terminalHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalHistoryRef.current) {
      terminalHistoryRef.current.scrollTop =
        terminalHistoryRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const nextIndex = (currentIndex + 1) % sortedFolders.length;
  const currentFolder = sortedFolders[currentIndex].name;
  const nextFolder = sortedFolders[nextIndex].name;

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

  useEffect(() => {
    if (targetIndex !== null) {
      const intervalId = setInterval(() => {
        setBarsOffset((prev) => prev + 5);
      }, 30);
      return () => clearInterval(intervalId);
    }
  }, [targetIndex]);

  const flipDuration =
    targetIndex !== null && autoFlipTotal > 0
      ? autoFlipCount === 0 || autoFlipCount === autoFlipTotal - 1
        ? 0.2
        : 0.1
      : 0.2;

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
        // Only add the success log if it isn’t already the last entry
        setTerminalHistory((prev) => {
          const lastLog = prev[prev.length - 1];
          const newLog = `RESULT: File "${authorizedFolder}" loaded successfully.`;
          if (lastLog === newLog) return prev;
          return [...prev, newLog];
        });
      }
      setTargetIndex(null);
      setAutoFlipCount(0);
      setAutoFlipTotal(0);
    }
  };

  const handleTerminalSubmit = () => {
    const input = terminalInput.trim();
    if (!input) return;

    if (input.toLowerCase().startsWith("cd ")) {
      const folderName = input.substring(3).trim();
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
          `RESULT: Access Denied.`,
        ]);
      }
      setTerminalInput("");
      return;
    }

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
          `RESULT: Access Denied.`,
        ]);
      }
      setTerminalInput("");
      return;
    }

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
        <LetterTabs
          visibleTabs={visibleLetterTabs}
          folderTabOffsets={folderTabOffsets}
          currentIndex={currentIndex}
        />
        <div className="background-folder">
          <span className="card-text">{nextFolder}</span>
        </div>
        <Card
          currentFolder={currentFolder}
          isFlipping={isFlipping}
          flipDuration={flipDuration}
          firstOccurrenceMap={firstOccurrenceMap}
          folderTabOffsets={folderTabOffsets}
          currentIndex={currentIndex}
          onClick={() => {
            if (!isFlipping && onFolderSelect) onFolderSelect(currentFolder);
            if (!isFlipping && currentFolder != authorizedFolder) {
              setTerminalHistory((prev) => [
                ...prev,
                `POINTER ACTION: Opening "${currentFolder}"...`,
                `RESULT: Access Denied.`,
              ]);
            }
          }}
          onAnimationEnd={handleAnimationEnd}
        />
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
      <Terminal
        terminalHistory={terminalHistory}
        terminalInput={terminalInput}
        onInputChange={(e) => setTerminalInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleTerminalSubmit();
          }
        }}
        historyRef={terminalHistoryRef}
      />
      {alertMessage && <CustomAlert message={alertMessage} />}
    </div>
  );
};

export default HingedFolders;
