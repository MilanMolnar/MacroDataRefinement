import React, { useEffect, useMemo, useRef, useState } from "react";
import BootScreen from "./components/Boot";
import HingedFolders, { Folder } from "./components/HingedFolders";
import SeveranceMDRLayout from "./components/MDR/Layout";
import SettingsMenu, { Settings } from "./components/Settings";
import CustomCursor from "./components/Cursor";
import VolumeAdjuster from "./components/MDR/VolumeAdjuster";
import bgMusicSrc from "./assets/sounds/music.mp3";
import BuyMeACoffeeButton from "./components/bmc";

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
  useEffect(() => {
    const originalPlay = Audio.prototype.play;
    Audio.prototype.play = function () {
      if (mutedRef.current) {
        return Promise.resolve();
      }
      return originalPlay.apply(this, arguments);
    };
    return () => {
      Audio.prototype.play = originalPlay;
    };
  }, []);

  // Mute state.
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  // Track which “screen” we’re showing.
  const [step, setStep] = useState<AppStep>("boot");
  // Save the folder name (user input) from BootScreen.
  const [userFolderName, setUserFolderName] = useState<string>("");
  // Settings state.
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [layoutKey, setLayoutKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  // Information modal state.
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  // Custom alert message.
  const [alertMessage, setAlertMessage] = useState("");

  // Update the folder list.
  const folderData: Folder[] = useMemo(() => {
    const folders = [...initialFolders];
    if (userFolderName && !folders.some((f) => f.name === userFolderName)) {
      folders.push({ id: folders.length + 1, name: userFolderName });
    }
    return folders;
  }, [userFolderName]);

  const handleBootComplete = (input: string) => {
    setUserFolderName(input);
    setStep("folders");
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setLayoutKey((prev) => prev + 1);
    setShowSettings(false);
  };

  const handleFolderSelect = (selectedFolder: string) => {
    if (selectedFolder === userFolderName) {
      setStep("layout");
    } else {
      setAlertMessage(
        "Access Denied: You are not authorized to access this folder."
      );
      setTimeout(() => setAlertMessage(""), 2000);
    }
  };

  const changeCursor = () => {
    return <CustomCursor />;
  };

  const handleShowCursor = () => {
    if (showCursor) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "none";
    }
    setShowCursor(!showCursor);
  };

  const minWidth = 1124;
  const minHeight = 868;
  const boxWidth = Math.max(settings.containerWidth, minWidth);
  const boxHeight = Math.max(settings.containerHeight, minHeight);

  // Background music state
  const [bgVolume, setBgVolume] = useState<number>(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      // Adjust volume multiplier as desired
      audioRef.current.volume = bgVolume * 0.1;
    }
  }, [bgVolume]);

  // When boot sequence starts, ensure we call play on the background music.
  const handlePower = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) =>
          console.error("Background music playback failed:", err)
        );
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDownUp {
          0% { top: -50px; opacity: 0; }
          20% { top: 20px; opacity: 1; }
          80% { top: 20px; opacity: 1; }
          100% { top: -50px; opacity: 0; }
        }
        .custom-alert {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          background-color: black;
          color: white;
          border: 2px solid white;
          padding: 10px 20px;
          font-family: monospace;
          z-index: 40000;
          animation: slideDownUp 2s ease-in-out forwards;
        }
      `}</style>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
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
              <BootScreen
                onComplete={handleBootComplete}
                onPower={handlePower}
              />
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
                headerText={userFolderName}
                percentage="0"
                key={layoutKey}
                settings={settings}
              />
            </div>
          )}
          {step === "layout" && (
            <>
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  position: "fixed",
                  top: 10,
                  left: 10,
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
                  left: 10,
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
                  left: 10,
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
              <button
                onClick={() => handleShowCursor()}
                style={{
                  position: "fixed",
                  top: 130,
                  left: 10,
                  zIndex: 25000,
                  backgroundColor: "black",
                  color: "white",
                  border: "2px solid white",
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}>
                {showCursor ? "Cursor to: Normal" : "Cursor to: Custom"}
              </button>
              <div
                style={{
                  position: "fixed",
                  bottom: 10,
                  left: 10,
                  zIndex: 250,
                }}>
                <VolumeAdjuster onVolumeChange={setBgVolume} />
              </div>
              {/* Mute Toggle Button */}
              <button
                onClick={() => setMuted((prev) => !prev)}
                style={{
                  position: "fixed",
                  bottom: 125,
                  left: 10,
                  zIndex: 25000,
                  width: "90px",
                  backgroundColor: "black",
                  color: "white",
                  justifyContent: "left",
                  textAlign: "left",
                  border: "2px solid white",
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                }}>
                {muted ? "Unmute" : "Mute"}
              </button>
            </>
          )}
          {showSettings && (
            <SettingsMenu
              initialSettings={settings}
              onSave={handleSaveSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
          {/* Extended Information Modal */}
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
                  Lemon Industries Severance Briefing
                </h2>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  Welcome to Lemon Industries. Your severance has been approved,
                  and you are now entering a controlled simulation where every
                  folder represents a critical operational directive. This
                  environment is designed to ensure absolute compliance and peak
                  efficiency.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  <strong>Operational Directive:</strong> Your task is to select
                  the folder that exactly matches the file name provided during
                  your initial briefing. Each folder embodies a specific
                  instruction. Only the folder that corresponds precisely with
                  your assigned file name will result in a successful operation.
                  Deviations from this mandate will trigger an immediate
                  operational error.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  <strong>Procedure and Execution:</strong> The simulation is
                  divided into multiple phases. First, the Boot Screen confirms
                  your identity. Next, the folder selection phase requires you
                  to navigate the hinged folders and select the correct
                  operational directive. Finally, the layout phase engages your
                  interaction with the production grid. Each phase is monitored
                  and evaluated for precision and compliance.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  <strong>Assistance Protocols:</strong> Should you experience
                  hesitation or inactivity, automated help pulses will be
                  deployed at regulated intervals. These pulses are designed to
                  enhance your situational awareness and guide you toward the
                  correct directive.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  <strong>Settings and Calibration:</strong> At any point,
                  access the Settings menu to recalibrate your operational
                  parameters. Adjust the workspace dimensions, grid
                  configuration, help intervals, and shape generation rates to
                  optimize performance. These settings are vital for maintaining
                  system integrity and maximizing throughput.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  <strong>How To Operate:</strong> Engage the operational boxes
                  using the <strong>A: 1, S: 2, D: 3, F: 4, G: 5</strong> keys.
                  Each key corresponds to a designated box that, when opened,
                  exposes a segment of critical data. Once a box is open, press
                  the <strong>spacebar</strong> to initiate data refinement.
                  Press the <strong>spacebar</strong> once more to close the box
                  once the data is refined. The refinement sequence is completed
                  only when all boxes are properly refined and closed—any
                  deviation may result in an operational error.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  <strong>Custom Interaction:</strong> For enhanced control,
                  toggle the custom cursor mode. This optional feature aligns
                  with Lemon's high‑security protocols and provides improved
                  operational precision.
                </p>
                <p
                  style={{
                    color: "white",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}>
                  Every command you execute is recorded and contributes to your
                  overall performance metrics. Efficiency, precision, and
                  absolute compliance are imperative. Failure to adhere to these
                  directives will result in an immediate error and possible
                  termination of your operation.
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
          {showCursor && <CustomCursor />}
        </div>
      </div>
      {/* Background Music Audio Element */}
      <audio ref={audioRef} src={bgMusicSrc} loop autoPlay preload="auto" />
      {alertMessage && <div className="custom-alert">{alertMessage}</div>}
      {/* Buy Me a Coffee Button at Bottom Right */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
        }}>
        {/* Buy Me a Coffee Button */}
        <BuyMeACoffeeButton />
      </div>
    </>
  );
};

export default App;
