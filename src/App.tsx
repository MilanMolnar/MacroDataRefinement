import React, { useEffect, useMemo, useRef, useState } from "react";
import BootScreen from "./components/Boot";
import HingedFolders, { Folder } from "./components/HingedFolders";
import SeveranceMDRLayout from "./components/MDR/Layout";
import SettingsMenu, { Settings } from "./components/Settings";
import CustomCursor from "./components/Cursor";
import VolumeAdjuster from "./components/MDR/VolumeAdjuster";
import bgMusicSrc from "./assets/sounds/music.mp3";
import BuyMeACoffeeButton from "./components/bmc";
import CRTFilterWrapper from "./components/CRTFilter";
import HelpGuideModal from "./components/tutorial";
import CustomAlert from "./components/MDR/CustomAlert";

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

  const [poweredOn, setPoweredOn] = useState(false);

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

  // Tutorial modal state.
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  // Custom alert message.
  const [alertMessage, setAlertMessage] = useState("");

  // Update the folder list.
  const folderData: Folder[] = useMemo(() => {
    const folders = [...severance_folders];
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
      audioRef.current.volume = bgVolume * 0.04;
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
    setTimeout(() => setPoweredOn(true), 500);
  };

  return (
    <>
      <CRTFilterWrapper>
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
              border: `${poweredOn ? "2px solid #acecfc" : "none"} `,
              backgroundColor: "black",
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              borderRadius: "25px",
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
              <div
                style={{
                  textAlign: "center",
                  width: "100%",
                  height: "100%",
                }}>
                <HingedFolders
                  folders={folderData}
                  onFolderSelect={handleFolderSelect}
                />
              </div>
            )}
            {step === "layout" && (
              <div
                style={{ textAlign: "center", width: "100%", height: "100%" }}>
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
                    maxWidth: "60vw",
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
                    Welcome to Lumon Industries. Your severance has been
                    approved, and you are now entering a controlled simulation
                    where every folder represents a critical operational
                    directive. This environment is designed to ensure absolute
                    compliance and peak efficiency.
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      marginBottom: "10px",
                    }}>
                    <strong>Operational Directive:</strong> Your task is to
                    select the folder that exactly matches the file name you
                    provided during the initial boot sequence. Each folder
                    embodies a specific instruction. Only the folder that
                    corresponds precisely with your assigned file name will
                    result in a successfully authorized operation. Deviations
                    from this mandate will trigger an immediate operational
                    error.
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      marginBottom: "10px",
                    }}>
                    <strong>Procedure and Execution:</strong> The simulation is
                    divided into multiple phases. First, the Boot Screen
                    confirms your identity. Next, the folder selection phase
                    requires you to navigate the folders and select the correct
                    operational directive. Finally, the refining phase engages
                    your interaction with the production grid. You need to find
                    each shape and corresponding storage box where the refined
                    data will be placed. Each phase is monitored and evaluated
                    for precision and compliance.
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      marginBottom: "10px",
                    }}>
                    <strong>Assistance Protocols:</strong> Should you experience
                    hesitation or inactivity, automated help pulses will be
                    deployed at regulated intervals. These pulses are designed
                    to enhance your situational awareness and guide you toward
                    the correct directive.
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
                    optimize performance. These settings are vital for
                    maintaining system integrity and maximizing throughput.
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      marginBottom: "10px",
                    }}>
                    <strong>How To Operate:</strong> Engage the operational
                    storage boxes using the provided keypad, use{" "}
                    <strong>A - G</strong> keys. Each key corresponds to a
                    designated box that, when opened, exposes a segment of
                    critical data. If you find data first, you can press the "Q"
                    key to open the storage unit assigned to that data. Once a
                    box is open, and the corresponding data is selected in
                    whole, press the <strong>spacebar</strong> to initiate data
                    refinement. Press the key assigned to the storage unit once
                    more to close the box once the data is refined. The
                    refinement sequence is completed only when all boxes are
                    properly refined and closed — any deviation may result in an
                    operational error.
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      marginBottom: "10px",
                    }}>
                    <strong>Custom Interaction:</strong> For enhanced control,
                    toggle the custom cursor mode. This optional feature aligns
                    with Lumon's high‑security protocols and provides improved
                    operational precision.
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      marginBottom: "10px",
                    }}>
                    Every command you execute is recorded and contributes to
                    your overall performance metrics. Efficiency, precision, and
                    absolute compliance are imperative. Failure to adhere to
                    these directives will result in an immediate error and
                    possible termination of your operation.
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

            {showTutorial && (
              <HelpGuideModal
                onClose={() => setShowTutorial(false)}></HelpGuideModal>
            )}
            {showCursor && <CustomCursor />}
          </div>
        </div>
        {/* Background Music Audio Element */}
        <audio ref={audioRef} src={bgMusicSrc} loop autoPlay preload="auto" />
        {alertMessage && <CustomAlert message={alertMessage}></CustomAlert>}
        {/* Buy Me a Coffee Button at Bottom Right */}
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
          }}>
          {/* Buy Me a Coffee Button */}
          {poweredOn && <BuyMeACoffeeButton />}
          {poweredOn && (
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
              Briefing
            </button>
          )}
          {poweredOn && (
            <button
              onClick={() => setShowTutorial(true)}
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
              I need help!
            </button>
          )}
        </div>
      </CRTFilterWrapper>
    </>
  );
};

export default App;
