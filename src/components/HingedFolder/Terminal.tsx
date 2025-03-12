import React from "react";

interface TerminalProps {
  terminalHistory: string[];
  terminalInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  historyRef: React.RefObject<HTMLDivElement | null>;
}

const Terminal: React.FC<TerminalProps> = ({
  terminalHistory,
  terminalInput,
  onInputChange,
  onKeyDown,
  historyRef,
}) => {
  return (
    <div className="terminal-container">
      <div className="terminal-history" ref={historyRef}>
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
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder="> "
      />
    </div>
  );
};

export default Terminal;
