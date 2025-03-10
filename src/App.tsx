import React, { useEffect, useMemo, useRef, useState } from "react";
import BootScreen from "./components/Boot";
import HingedFolders, { Folder } from "./components/HingedFolder/HingedFolders";
import SeveranceMDRLayout from "./components/MDR/Layout";
import SettingsMenu, { Settings } from "./components/Settings";
import CustomCursor from "./components/Cursor";
import VolumeAdjuster from "./components/MDR/VolumeAdjuster";
import bgMusicSrc from "./assets/sounds/music.mp3";
import BuyMeACoffeeButton from "./components/bmc";
import CRTFilterWrapper from "./components/CRTFilter";
import CustomAlert from "./components/MDR/CustomAlert";
import { Analytics } from "@vercel/analytics/react";
import Briefing from "./components/Briefing";
import borderImageSrc from "./assets/border4.png";
import MusicSelectorModal from "./components/MDR/MusicSelectorModal";
import Folders from "./components/Folders";
import HelpGuideModal from "./components/Tutorial";

const defaultSettings: Settings = {
  containerWidth: 1010,
  containerHeight: 605,
  msToHelp: 10000,
  rows: 12,
  cols: 36,
  headerHeight: 40,
  shapePerType: 1,
};

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
  const [_, setPoweredOn] = useState(false);
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
  const [percentage, setPercentage] = useState<number>(0);
  const [userWon, setUserWon] = useState(false);
  const [bgMusic, setBgMusic] = useState<string>(bgMusicSrc);
  const [bgVolume, setBgVolume] = useState<number>(0.5);
  const [showMusicModal, setShowMusicModal] = useState(false);

  const mutedRef = useRef(muted);
  const audioRef = useRef<HTMLAudioElement>(null);

  const minWidth = 1800;
  const minHeight = 1000;
  const boxWidth = Math.max(settings.containerWidth, minWidth);
  const boxHeight = Math.max(settings.containerHeight, minHeight);

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
    setUserWon(percentage >= 100);
  }, [percentage]);

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
      setAlertMessage(
        "Access Denied: You are not authorized to access this folder."
      );
      setTimeout(() => setAlertMessage(""), 2000);
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
    setPercentage(0);
  };

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
      <div style={fullScreenCenterStyle}>
        <div
          style={{
            position: "relative",
            width: `${boxWidth}px`,
            height: `${boxHeight}px`,
            overflow: "hidden",
            backgroundColor: "transparent",
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
                  }}>
                  <div style={{ textAlign: "center" }}>
                    <HingedFolders
                      folders={folderData}
                      onFolderSelect={handleFolderSelect}
                      highlightFolder={userWon ? userFolderName : undefined}
                    />
                  </div>
                </div>
              )}
              {step === "layout" && (
                <div
                  style={{
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                  }}>
                  <a
                    href="https://buymeacoffee.com/milanmolnar"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "-360px",
                      height: "120px",
                      width: "100px",
                      zIndex: 2995000,
                      backgroundColor: "black",
                      color: "white",
                      border: "2px solid white",
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}></a>
                  <SeveranceMDRLayout
                    headerText={userFolderName}
                    percentage={percentage.toString()}
                    key={layoutKey}
                    settings={settings}
                    onWin={() => setUserWon(true)}
                  />
                  <button
                    onClick={handleRestart}
                    style={{ ...baseButtonStyle, backgroundColor: "red" }}>
                    Restart
                  </button>
                </div>
              )}
              {showCursor && <CustomCursor />}
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
                      setTimeout(() => setAlertMessage(""), 100);
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
    </>
  );
};

export default App;
