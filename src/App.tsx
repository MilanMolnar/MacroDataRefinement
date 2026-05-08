import React, { useEffect, useMemo, useRef, useState } from "react";
import BootScreen from "./components/Boot";
import HingedFolders, { Folder } from "./components/HingedFolder";
import SeveranceMDRLayout from "./components/MDR/Layout";
import SettingsMenu, { Settings } from "./components/modals/Settings";
import CustomCursor from "./components/Cursor";
import VolumeAdjuster from "./components/VolumeAdjuster";
import bgMusicSrc from "./assets/sounds/music.mp3";
import BuyMeACoffeeButton from "./components/bmc";
import CRTFilterWrapper from "./components/CRTFilter";
import CustomAlert from "./components/common/CustomAlert";
import { Analytics } from "@vercel/analytics/react";
import Briefing from "./components/modals/Briefing";
import borderImageSrc from "./assets/border4.png";
import MusicSelectorModal from "./components/MusicSelectorModal";
import Folders from "./components/HingedFolder/Folders";
import HelpGuideModal from "./components/modals/Tutorial";

const defaultSettings: Settings = {
  containerWidth: 1010,
  containerHeight: 605,
  msToHelp: 10000,
  rows: 12,
  cols: 36,
  headerHeight: 40,
  shapePerType: 1,
};

// The design was built at 1920×1080. We scale the game canvas to fit the
// current viewport while keeping the monitor image and all pixel-based
// coordinate math in sync.
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const MIN_SUPPORTED_WIDTH = 1280;
const MIN_SUPPORTED_HEIGHT = 720;

const severanceFolders: Folder[] = Folders;

type AppStep = "boot" | "folders" | "layout";

// Common style objects for consistency
const fullScreenCenterStyle: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  backgroundImage:
    "radial-gradient(circle at center, rgb(20, 27, 5) 0%, black 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalFullScreenStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 7000,
};

const menuModalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.8)",
  zIndex: 6000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "black",
  border: "2px solid white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const baseButtonStyle: React.CSSProperties = {
  border: "2px solid white",
  padding: "5px 10px",
  cursor: "pointer",
  fontFamily: "monospace",
  color: "white",
  backgroundColor: "black",
};

const App: React.FC = () => {
  // State declarations
  const [muted, setMuted] = useState(false);
  const [step, setStep] = useState<AppStep>("boot");
  const [userFolderName, setUserFolderName] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [layoutKey, setLayoutKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [userWon, setUserWon] = useState(false);
  const [bgMusic, setBgMusic] = useState<string>(bgMusicSrc);
  const [bgVolume, setBgVolume] = useState<number>(0.5);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [monitorMode, setMonitorMode] = useState(true);
  const [folderAlertMessage, setFolderAlertMessage] = useState("");
  const [folderAlertKey, setFolderAlertKey] = useState(0);

  const mutedRef = useRef(muted);
  const audioRef = useRef<HTMLAudioElement>(null);
  const folderAlertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minWidth = 1800;
  const minHeight = 1000;
  const boxWidth = Math.max(settings.containerWidth, minWidth);
  const boxHeight = Math.max(settings.containerHeight, minHeight);

  // --- Responsive scaling ---
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scale the design canvas down to fit the viewport, max 1:1 at 1920×1080.
  const viewportScale = Math.min(
    1.0,
    Math.min(
      viewportSize.width / DESIGN_WIDTH,
      viewportSize.height / DESIGN_HEIGHT
    )
  );
  // MDR Layout outer container is exactly (containerWidth+50) × (containerHeight+200) px.
  // Use those dimensions for both the scale factor and the fullscreen canvas size.
  const fsContentW = settings.containerWidth + 50;
  const fsContentH = settings.containerHeight + 100;   // inner div height (not outer +200), so content fills viewport height
  // Scale uniformly so the content fits within the viewport (aspect ratio preserved),
  // then anchor to top-left so there is no margin on the left, top, or bottom.
  const fullscreenScale = Math.min(
    viewportSize.width / fsContentW,
    viewportSize.height / fsContentH
  );
  // Center the scaled canvas horizontally within the viewport.
  const fsOffsetX = (viewportSize.width - fsContentW * fullscreenScale) / 2;
  const fsOffsetY = 0;
  const tooSmall =
    viewportSize.width < MIN_SUPPORTED_WIDTH ||
    viewportSize.height < MIN_SUPPORTED_HEIGHT;

  // Side effects and event handlers
  useEffect(() => {
    document.body.style.backgroundColor = "black";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    const originalPlay = Audio.prototype.play;
    Audio.prototype.play = function () {
      if (mutedRef.current) return Promise.resolve();
      return originalPlay.apply(this, arguments);
    };
    return () => {
      Audio.prototype.play = originalPlay;
    };
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenuModal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = bgVolume * 0.04;
  }, [bgVolume]);

  const folderData: Folder[] = useMemo(() => {
    const folders = [...severanceFolders];
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
      if (folderAlertTimeoutRef.current) clearTimeout(folderAlertTimeoutRef.current);
      setFolderAlertKey((prev) => prev + 1);
      setFolderAlertMessage("INSUFFICIENT CLEARANCE TO OPEN SELECTED FOLDER");
      folderAlertTimeoutRef.current = setTimeout(() => setFolderAlertMessage(""), 1400);
    }
  };

  const handleShowCursor = () => {
    document.body.style.cursor = showCursor ? "none" : "pointer";
    setShowCursor(!showCursor);
  };

  const handleRestart = () => {
    setStep("boot");
    setUserFolderName("");
    setLayoutKey(0);
  };

  const handlePower = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) =>
          console.error("Background music playback failed:", err)
        );
    }
  };

  const copyShareMessage = () => {
    const shareMessage = `I have brought glory to the company, try out this Lumon MDR simulator and make Kier proud. Link: ${window.location.href}`;
    navigator.clipboard
      .writeText(shareMessage)
      .then(() =>
        setAlertMessage("Share message copied! Paste it for your friends.")
      )
      .catch(() =>
        setAlertMessage("Failed to copy share message. Please try again.")
      );
  };



  return (
    <>
      {/* ── Outer viewport shell ─────────────────────────────────────────── */}
      <div
        style={
          monitorMode
            ? fullScreenCenterStyle
            : {
                position: "fixed",
                inset: 0,
                overflow: "hidden",
                backgroundColor: "black",
              }
        }>
        {/* ── Scaled game canvas ─────────────────────────────────────────── */}
        <div
          style={
            monitorMode
              ? {
                  position: "relative",
                  width: `${boxWidth * viewportScale}px`,
                  height: `${boxHeight * viewportScale}px`,
                  flexShrink: 0,
                  overflow: "hidden",
                }
              : {
                  position: "absolute",
                  top: `${fsOffsetY}px`,
                  left: `${fsOffsetX}px`,
                  width: `${fsContentW}px`,
                  height: `${fsContentH}px`,
                  transform: `scale(${fullscreenScale})`,
                  transformOrigin: "top left",
                  overflow: "hidden",
                  backgroundColor: "transparent",
                  cursor: showCursor ? "none" : "pointer",
                }
          }>
          {/* monitor mode has an extra inner div for its own scaling */}
          {monitorMode ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${boxWidth}px`,
                height: `${boxHeight}px`,
                transform: `scale(${viewportScale})`,
                transformOrigin: "top left",
                overflow: "hidden",
                backgroundColor: "transparent",
                cursor: showCursor ? "none" : "pointer",
              }}>
              <CRTFilterWrapper>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    marginTop: 120,
                    flexDirection: "column",
                    transform: "translateX(192px)",
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
                        backgroundColor: "black",
                        height: "800px",
                        width: "1050px",
                        position: "relative",
                      }}>
                      <div style={{ textAlign: "center" }}>
                        <HingedFolders
                          folders={folderData}
                          onFolderSelect={handleFolderSelect}
                        />
                      </div>
                      {folderAlertMessage && (
                        <CustomAlert key={folderAlertKey} message={folderAlertMessage} contained />
                      )}
                    </div>
                  )}
                  {step === "layout" && (
                    <div
                      style={{
                        textAlign: "center",
                        width: "100%",
                        height: "100%",
                      }}>
                      <SeveranceMDRLayout
                        headerText={userFolderName}
                        key={layoutKey}
                        settings={settings}
                        onWin={() => setUserWon(true)}
                        viewportScale={viewportScale}
                      />
                    </div>
                  )}
                </div>
              </CRTFilterWrapper>
              <img
                src={borderImageSrc}
                alt="App Border"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 3000,
                  filter: "none",
                }}
              />
            </div>
          ) : (
            <CRTFilterWrapper>
              <div
                style={{
                  width: "100%",
                  height: "100%",
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
                      backgroundColor: "black",
                      height: "800px",
                      width: "1050px",
                      position: "relative",
                    }}>
                    <div style={{ textAlign: "center" }}>
                      <HingedFolders
                        folders={folderData}
                        onFolderSelect={handleFolderSelect}
                      />
                    </div>
                    {folderAlertMessage && (
                      <CustomAlert key={folderAlertKey} message={folderAlertMessage} contained />
                    )}
                  </div>
                )}
                {step === "layout" && (
                  <div
                    style={{
                      textAlign: "center",
                      width: "100%",
                      height: "100%",
                    }}>
                    <SeveranceMDRLayout
                      headerText={userFolderName}
                      key={layoutKey}
                      settings={settings}
                      onWin={() => setUserWon(true)}
                      viewportScale={fullscreenScale}
                    />
                  </div>
                )}
              </div>
            </CRTFilterWrapper>
          )}
        </div>
      </div>

      {showMenuModal && (
        <div
          style={menuModalOverlayStyle}
          onClick={() => setShowMenuModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {!showSounds ? (
              <>
                <div style={{ textAlign: "center" }}>MENU</div>
                <button
                  onClick={() => setShowSettings(true)}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: userWon ? "green" : "black",
                  }}>
                  Settings
                </button>
                <button
                  onClick={() => setShowInfoModal(true)}
                  style={baseButtonStyle}>
                  Briefing
                </button>
                <button
                  onClick={() => setShowTutorial(true)}
                  style={baseButtonStyle}>
                  I need help!
                </button>
                <button
                  onClick={() => {
                    if (userWon) {
                      handleShowCursor();
                    } else {
                      setAlertMessage(
                        "You have not earned that special perk yet"
                      );
                      setTimeout(() => setAlertMessage(""), 2000);
                    }
                  }}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: userWon ? "green" : "gray",
                    cursor: userWon ? "pointer" : "not-allowed",
                  }}>
                  {showCursor ? "Normal Cursor" : "Lumon pointer"}
                </button>
                <button
                  onClick={() => setShowSounds(true)}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: userWon ? "green" : "black",
                  }}>
                  Sounds & Music
                </button>
                <button onClick={handleRestart} style={baseButtonStyle}>
                  Restart
                </button>
                <button
                  onClick={() => setShowMenuModal(false)}
                  style={baseButtonStyle}>
                  Close Menu
                </button>
                <button
                  onClick={() => {
                    copyShareMessage();
                    const shareMessage = `Try out the most realistic Lumon MDR simulator, and make Kier proud. Link: ${window.location.href}`;
                    const shareUrl = window.location.href;
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "Lumon Message",
                          text: shareMessage,
                          url: shareUrl,
                        })
                        .catch((error) => console.log("Error sharing:", error));
                    } else {
                      alert("Share feature is not supported in this browser.");
                    }
                  }}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: "white",
                    color: "black",
                    padding: "6px 10px",
                  }}>
                  Share with your innies!
                </button>
                <BuyMeACoffeeButton />
              </>
            ) : (
              <>
                <VolumeAdjuster onVolumeChange={setBgVolume} />
                <button
                  onClick={() => setMuted((prev) => !prev)}
                  style={baseButtonStyle}>
                  {muted ? "Unmute" : "Mute"}
                </button>
                <button
                  onClick={() => {
                    if (userWon) {
                      setShowMusicModal(true);
                    } else {
                      setAlertMessage(
                        "You have not earned that special perk yet"
                      );
                      setTimeout(() => setAlertMessage(""), 2000);
                    }
                  }}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: userWon ? "green" : "gray",
                    cursor: userWon ? "pointer" : "not-allowed",
                  }}>
                  Change Music Box
                </button>
                <button
                  onClick={() => setShowSounds(false)}
                  style={baseButtonStyle}>
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showMusicModal && (
        <MusicSelectorModal
          currentTrackSrc={bgMusic}
          onMusicSelect={(newSrc: string) => setBgMusic(newSrc)}
          onClose={() => setShowMusicModal(false)}
        />
      )}

      {showSettings && (
        <div style={modalFullScreenStyle}>
          <SettingsMenu
            initialSettings={settings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
            userWon={userWon}
          />
        </div>
      )}

      {showInfoModal && (
        <div style={modalFullScreenStyle}>
          <Briefing setShowInfoModal={setShowInfoModal} />
        </div>
      )}

      {showTutorial && (
        <div style={modalFullScreenStyle}>
          <HelpGuideModal onClose={() => setShowTutorial(false)} />
        </div>
      )}

      <audio ref={audioRef} src={bgMusic} loop autoPlay preload="auto" />
      {alertMessage && <CustomAlert message={alertMessage} />}
      <Analytics />
      {showCursor && <CustomCursor />}

      {/* Monitor toggle — fixed to bottom-left corner */}
      <button
        onClick={() => setMonitorMode((prev) => !prev)}
        title={monitorMode ? "Switch to fullscreen mode" : "Switch to monitor mode"}
        style={{
          position: "fixed",
          bottom: "12px",
          left: "12px",
          zIndex: 999998,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #acecfc",
          color: "#acecfc",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          padding: "4px 8px",
          cursor: "pointer",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}>
        {monitorMode ? "[ ] FULLSCREEN" : "[■] MONITOR"}
      </button>

      {/* Resolution warning — blocks gameplay when the viewport is below 720p.
          Uses position:fixed outside the scaled game container so it always
          fills the true viewport regardless of CSS transforms. */}
      {tooSmall && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#acecfc",
            fontFamily: "monospace",
            textAlign: "center",
            gap: "12px",
            padding: "20px",
          }}>
          <div style={{ fontSize: "1.4rem", letterSpacing: "0.15em" }}>
            LUMON INDUSTRIES
          </div>
          <div
            style={{ borderTop: "1px solid #acecfc", width: "320px" }}
          />
          <div style={{ fontSize: "1rem" }}>
            WORKSTATION DISPLAY RESOLUTION INSUFFICIENT
          </div>
          <div
            style={{ fontSize: "0.85rem", color: "#5a9fb0", marginTop: "8px" }}>
            Minimum required: {MIN_SUPPORTED_WIDTH} × {MIN_SUPPORTED_HEIGHT}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#5a9fb0" }}>
            Current: {viewportSize.width} × {viewportSize.height}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#3a6f7e",
              marginTop: "8px",
              maxWidth: "420px",
            }}>
            Please resize your browser window to continue your important work.
          </div>
        </div>
      )}
    </>
  );
};

export default App;
