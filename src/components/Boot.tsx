import React, { useEffect, useRef, useState } from "react";
import typingSoundSrc from "../assets/sounds/typing.mp3";
import RockerSwitch from "./RockerSwitch"; // adjust the path as needed

interface BootScreenProps {
  onComplete: (input: string) => void;
  onPower?: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete, onPower }) => {
  const bootLines = [
    "LEMON OS",
    "parseElements: keyboard: 0 digitizer:  12 pointer 0 0 scroll: 0 led: 0",
    "startupTask",
    "Video has output streams: 1",
    "Reuse output buffer index:2 dev:Code Output offset:184000 size20800",
    "Audio has output streams: 1",
    "DisableInput = 0",
    "skipCached = 0",
    "PortTyped:3, Lenght: 128",
    "…",
  ];
  const promptLine = ">Enter file name: ";

  const [bootStarted, setBootStarted] = useState(false);
  const [switchedOn, setSwitchedOn] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Ref to control skipping the boot sequence.
  const skipRef = useRef(false);
  // Ref for the input element.
  const inputRef = useRef<HTMLInputElement>(null);

  // Unlock audio by playing a silent sound.
  const unlockAudio = () => {
    const audio = new Audio(typingSoundSrc);
    audio.volume = 0;
    audio.play().catch(() => {});
  };

  // When the switch is toggled on.
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSwitchedOn(true);
      unlockAudio();
      if (onPower) onPower();
      // Delay starting the boot sequence to let the switch animation be seen.
      setTimeout(() => {
        setBootStarted(true);
      }, 500);
    }
  };

  // Boot sequence: type out each boot line, then the prompt.
  useEffect(() => {
    if (!bootStarted) return;
    let isCancelled = false;
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const typeLine = async (line: string) => {
      setCurrentLine("");
      for (let i = 0; i < line.length; i++) {
        if (isCancelled || skipRef.current) return;
        const char = line[i];
        setCurrentLine((prev) => prev + char);
        // Play typing sound for each character.
        const audio = new Audio(typingSoundSrc);
        audio.volume = 0.05;
        audio.playbackRate = 0.95 + Math.random() * 0.1;
        audio.play().catch(() => {});
        await delay(60);
      }
    };

    const runBootSequence = async () => {
      for (const line of bootLines) {
        if (skipRef.current) break;
        await typeLine(line);
        if (isCancelled || skipRef.current) return;
        setDisplayedLines((prev) => [...prev, line]);
        setCurrentLine("");
        await delay(300);
      }
      if (skipRef.current) {
        setDisplayedLines(bootLines);
        setCurrentLine(promptLine);
      } else {
        await typeLine(promptLine);
      }
      if (isCancelled) return;
      setShowInput(true);
      inputRef.current?.focus();
    };

    runBootSequence();
    return () => {
      isCancelled = true;
    };
  }, [bootStarted]);

  // When container is clicked, if boot is in progress, skip ahead.
  const handleContainerClick = () => {
    if (!bootStarted) return;
    if (!showInput) {
      skipRef.current = true;
      setDisplayedLines(bootLines);
      setCurrentLine(promptLine);
      setShowInput(true);
      inputRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  };

  // Before boot sequence starts, display the RockerSwitch.
  if (!bootStarted) {
    return (
      <div
        onClick={handleContainerClick}
        style={{
          minHeight: "60vh",
          width: "100%",
          paddingTop: "0px",
          backgroundColor: "black",
          color: "white",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <div>
          <RockerSwitch checked={switchedOn} onChange={handleSwitchChange} />
        </div>
        <div style={{ marginTop: "1em", fontSize: "2rem" }}>Power</div>
        <div style={{ marginTop: "0.5em" }}>Flip Switch to Power On</div>
      </div>
    );
  }

  // Once boot has started, display the boot sequence.
  return (
    <div
      onClick={handleContainerClick}
      style={{
        backgroundColor: "black",
        color: "white",
        fontFamily: "monospace",
        padding: "20px",
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        textAlign: "left",
      }}>
      {displayedLines.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
      <div>
        <span>{currentLine}</span>
        {showInput && (
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onComplete(inputValue);
              }
            }}
            style={{
              backgroundColor: "black",
              color: "white",
              border: "none",
              outline: "none",
              fontFamily: "monospace",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BootScreen;
