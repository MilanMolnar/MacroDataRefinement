import React, { useState, useMemo, useEffect } from "react";
import BootScreen from "./components/Boot";
import HingedFolders, { Folder } from "./components/HingedFolders";
import SeveranceMDRLayout from "./components/MDR/Layout";
import SettingsMenu, { Settings } from "./components/Settings";
import CustomCursor from "./components/Cursor";

// Example default settings (unchanged)
const defaultSettings: Settings = {
  containerWidth: 1124,
  containerHeight: 768,
  msToHelp: 10000,
  rows: 16,
  cols: 41,
  headerHeight: 40,
  shapePerType: 1,
};

// The folder data you already had.
const initialFolders: Folder[] = [
  { id: 1, name: "Asldr1" },
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

type AppStep = "boot" | "folders" | "layout";

const App: React.FC = () => {
  // Set the document body background to black.
  useEffect(() => {
    document.body.style.backgroundColor = "black";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Track which “screen” we’re showing.
  const [step, setStep] = useState<AppStep>("boot");
  // Save the folder name (user input) from BootScreen.
  const [userFolderName, setUserFolderName] = useState<string>("");
  // Settings (and other state such as for the settings menu).
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [layoutKey, setLayoutKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  // New state for the information modal.
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Update the folder list: if the user’s folder isn’t already there, add it.
  const folderData: Folder[] = useMemo(() => {
    const folders = [...initialFolders];
    if (userFolderName && !folders.some((f) => f.name === userFolderName)) {
      folders.push({ id: folders.length + 1, name: userFolderName });
    }
    return folders;
  }, [userFolderName]);

  // When BootScreen completes (user presses Enter).
  const handleBootComplete = (input: string) => {
    setUserFolderName(input);
    setStep("folders");
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    // Increment the key so that SeveranceMDRLayout unmounts and remounts.
    setLayoutKey((prev) => prev + 1);
    setShowSettings(false);
  };

  // When a folder is clicked in HingedFolders:
  // If it matches the user’s input, we advance to the layout.
  // Otherwise, we show an error.
  const handleFolderSelect = (selectedFolder: string) => {
    if (selectedFolder === userFolderName) {
      setStep("layout");
    } else {
      alert("Error: Incorrect folder selected!");
    }
  };

  // Compute the box dimensions.
  const minWidth = 1124;
  const minHeight = 868;
  const boxWidth = Math.max(settings.containerWidth, minWidth);
  const boxHeight = Math.max(settings.containerHeight, minHeight);

  return (
    // Fullscreen container centered horizontally and vertically.
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      {/* The centered black box */}
      <div
        style={{
          backgroundColor: "black",
          width: `${boxWidth}px`,
          height: `${boxHeight}px`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
        {step === "boot" && (
          <div style={{ width: "100%", height: "100%" }}>
            <BootScreen onComplete={handleBootComplete} />
          </div>
        )}
        {step === "folders" && (
          <div style={{ textAlign: "center", width: "100%", height: "100%" }}>
            <HingedFolders
              folders={folderData}
              onFolderSelect={handleFolderSelect}
            />
          </div>
        )}
        {step === "layout" && (
          <div style={{ textAlign: "center", width: "100%", height: "100%" }}>
            <SeveranceMDRLayout
              headerText={userFolderName} // use user input as header
              percentage="0"
              key={layoutKey}
              settings={settings}
            />
          </div>
        )}
        {/* Fixed control buttons displayed only in layout step */}
        {step === "layout" && (
          <>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                position: "fixed",
                top: 10,
                right: 10,
                zIndex: 25000,
                backgroundColor: "black",
                color: "white",
                border: "2px solid white",
                padding: "5px 10px",
                cursor: "pointer",
                fontFamily: "monospace",
              }}>
              Settings
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                position: "fixed",
                top: 50,
                right: 10,
                zIndex: 25000,
                backgroundColor: "black",
                color: "white",
                border: "2px solid white",
                padding: "5px 10px",
                cursor: "pointer",
                fontFamily: "monospace",
              }}>
              Restart
            </button>
            <button
              onClick={() => setShowInfoModal(true)}
              style={{
                position: "fixed",
                top: 90,
                right: 10,
                zIndex: 25000,
                backgroundColor: "black",
                color: "white",
                border: "2px solid white",
                padding: "5px 10px",
                cursor: "pointer",
                fontFamily: "monospace",
              }}>
              Information
            </button>
          </>
        )}
        {/* Settings Modal */}
        {showSettings && (
          <SettingsMenu
            initialSettings={settings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
        {/* Information Modal */}
        {showInfoModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 30000,
            }}
            onClick={() => setShowInfoModal(false)}>
            <div
              style={{
                backgroundColor: "black",
                padding: "20px",
                border: "2px solid white",
                maxWidth: "80vw",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}>
              <h2
                style={{
                  color: "white",
                  fontFamily: "monospace",
                  marginBottom: "10px",
                }}>
                Lumon Industries Severance Briefing
              </h2>
              <p
                style={{
                  color: "white",
                  fontFamily: "monospace",
                  marginBottom: "10px",
                }}>
                Welcome to Lumon Industries. In adherence with our strict
                protocols, your severance has been approved. You are now
                entering a controlled simulation where each folder represents a
                critical operational directive.
              </p>
              <p
                style={{
                  color: "white",
                  fontFamily: "monospace",
                  marginBottom: "10px",
                }}>
                Your objective is to select the folder that exactly matches the
                file name provided during your initial briefing. Failure to
                comply will result in an operational error. Hints will be
                automatically deployed after a brief period of inactivity.
              </p>
              <p
                style={{
                  color: "white",
                  fontFamily: "monospace",
                  marginBottom: "10px",
                }}>
                To execute an operation, simply click on the appropriate folder.
                Every action is monitored and contributes to your overall
                performance metrics. Efficiency, precision, and compliance are
                paramount.
              </p>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  marginTop: "20px",
                  padding: "5px 10px",
                  backgroundColor: "black",
                  color: "white",
                  border: "2px solid white",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}>
                Close
              </button>
            </div>
          </div>
        )}
        {/* Custom Cursor */}
        <CustomCursor />
      </div>
    </div>
  );
};

export default App;
