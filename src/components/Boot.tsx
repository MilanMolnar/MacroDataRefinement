import React, { useState, useEffect, useRef } from "react";

interface BootScreenProps {
  onComplete: (input: string) => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
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
    "...",
  ];
  const promptLine = ">Enter file name: ";

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(""); // for user input

  // Create a ref for the input element.
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isCancelled = false;
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const typeLine = async (line: string) => {
      setCurrentLine("");
      for (let i = 0; i < line.length; i++) {
        if (isCancelled) return;
        setCurrentLine((prev) => prev + line[i]);
        await delay(25);
      }
    };

    const runBootSequence = async () => {
      for (const line of bootLines) {
        await typeLine(line);
        if (isCancelled) return;
        setDisplayedLines((prev) => [...prev, line]);
        setCurrentLine("");
        await delay(300);
      }
      await typeLine(promptLine);
      if (isCancelled) return;
      setShowInput(true);
      // Auto focus the input when it becomes visible.
      inputRef.current?.focus();
    };

    runBootSequence();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Handler to auto focus the input when clicking anywhere inside the container.
  const handleContainerClick = () => {
    if (showInput) {
      inputRef.current?.focus();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      style={{
        backgroundColor: "black",
        color: "white",
        fontFamily: "monospace",
        padding: "20px",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        textAlign: "left", // Justify text left-to-right
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
