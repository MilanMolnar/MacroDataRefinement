import React, { useState } from "react";

export interface Settings {
  containerWidth: number;
  containerHeight: number;
  msToHelp: number;
  rows: number;
  cols: number;
  headerHeight: number;
  shapePerType: number;
}

interface SettingsMenuProps {
  initialSettings: Settings;
  onSave: (newSettings: Settings) => void;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  initialSettings,
  onSave,
  onClose,
}) => {
  const [containerWidth, setContainerWidth] = useState(
    initialSettings.containerWidth
  );
  const [containerHeight, setContainerHeight] = useState(
    initialSettings.containerHeight
  );
  const [msToHelp, setMsToHelp] = useState(initialSettings.msToHelp);
  const [rows, setRows] = useState(initialSettings.rows);
  const [cols, setCols] = useState(initialSettings.cols);
  const [headerHeight, setHeaderHeight] = useState(
    initialSettings.headerHeight
  );
  // Now enable any positive integer for shapePerType
  const [shapePerType, setShapePerType] = useState(
    initialSettings.shapePerType
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Warning: The save function is experimental and easily breaks the game. If the game is not working as intended, please refresh the page. Do you want to proceed?"
    );
    if (!confirmed) {
      return;
    }
    const newSettings: Settings = {
      containerWidth,
      containerHeight,
      msToHelp,
      rows,
      cols,
      headerHeight,
      shapePerType,
    };

    // Call parent's onSave with the new settings.
    onSave(newSettings);
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "15px" }}>Settings</h2>

        <div style={fieldStyle}>
          <label>Container Width:</label>
          <span style={infoStyle}>
            The width of the grid container (in pixels).
          </span>
          <input
            type="number"
            value={containerWidth}
            onChange={(e) => setContainerWidth(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Container Height:</label>
          <span style={infoStyle}>
            The height of the grid container (in pixels).
          </span>
          <input
            type="number"
            value={containerHeight}
            onChange={(e) => setContainerHeight(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>ms To Help:</label>
          <span style={infoStyle}>
            The interval (in milliseconds) between red help pulses when you open
            a box.
          </span>
          <input
            type="number"
            value={msToHelp}
            onChange={(e) => setMsToHelp(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Rows:</label>
          <span style={infoStyle}>The number of rows in the grid.</span>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Cols:</label>
          <span style={infoStyle}>The number of columns in the grid.</span>
          <input
            type="number"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Shapes Per Type:</label>
          <span style={infoStyle}>
            The number of shapes to generate for each type. Enter any positive
            integer.
          </span>
          <input
            type="number"
            value={shapePerType}
            onChange={(e) => setShapePerType(Number(e.target.value))}
            style={inputStyle}
            min={1}
          />
        </div>

        <div style={buttonRowStyle}>
          <button type="button" onClick={onClose} style={buttonStyle}>
            Cancel
          </button>
          <button type="submit" style={buttonStyle}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 20000,
};

const formStyle: React.CSSProperties = {
  backgroundColor: "black",
  border: "2px solid white",
  padding: "20px",
  width: "300px",
  borderRadius: "8px",
  color: "white",
};

const fieldStyle: React.CSSProperties = {
  marginBottom: "10px",
  display: "flex",
  flexDirection: "column",
};

const inputStyle: React.CSSProperties = {
  padding: "5px",
  marginTop: "5px",
  backgroundColor: "black",
  border: "1px solid white",
  color: "white",
};

const infoStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaa",
  marginBottom: "3px",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "15px",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "black",
  border: "2px solid white",
  color: "white",
  padding: "5px 10px",
  cursor: "pointer",
};

export default SettingsMenu;
