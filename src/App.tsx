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
import { Analytics } from "@vercel/analytics/react";
import Briefing from "./components/Briefing";
import borderImageSrc from "./assets/border4.png";
import MusicSelectorModal from "./components/MDR/MusicSelectorModal";

const defaultSettings: Settings = {
  containerWidth: 1010,
  containerHeight: 605,
  msToHelp: 10000,
  rows: 12,
  cols: 36,
  headerHeight: 40,
  shapePerType: 1,
};

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

  const [poweredOn, setPoweredOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

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

  // New state: percentage (simulate progress) and persistent win state.
  const [percentage, setPercentage] = useState<number>(0);
  const [userWon, setUserWon] = useState(false);

  // New state for background music source.
  const [bgMusic, setBgMusic] = useState<string>(bgMusicSrc);

  // When percentage is 100 or more, update win state.
  useEffect(() => {
    console.log("headerPercentage", percentage);
    if (percentage >= 100) {
      setUserWon(true);
    } else {
      setUserWon(false);
    }
  }, [percentage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenuModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    if (selectedFolder === userFolderName) setStep("layout");
    else {
      setAlertMessage(
        "Access Denied: You are not authorized to access this folder."
      );
      setTimeout(() => setAlertMessage(""), 2000);
    }
  };

  const handleShowCursor = () => {
    if (showCursor) document.body.style.cursor = "pointer";
    else document.body.style.cursor = "none";
    setShowCursor(!showCursor);
  };

  // Instead of reloading the page, create a restart handler that resets game state but preserves the win state.
  const handleRestart = () => {
    // Reset progress-related state.
    setStep("boot");
    setUserFolderName("");
    setLayoutKey(0);
    setPercentage(0);
    // Note: we intentionally do not reset userWon so that the win perk persists.
  };

  // Container sizing.
  const minWidth = 1800;
  const minHeight = 1000;
  const boxWidth = Math.max(settings.containerWidth, minWidth);
  const boxHeight = Math.max(settings.containerHeight, minHeight);

  const [bgVolume, setBgVolume] = useState<number>(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = bgVolume * 0.04;
  }, [bgVolume]);

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

  // New state: show the music selector modal.
  const [showMusicModal, setShowMusicModal] = useState(false);

  return (
    <>
      {/* Main Container */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage:
            "radial-gradient(circle at center,rgb(20, 27, 5) 0%, black 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <div
          style={{
            position: "relative",
            width: `${boxWidth}px`,
            height: `${boxHeight}px`,
            overflow: "hidden",
            backgroundColor: "rgb(0, 0, 0, 0)",
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

                  {/* Restart button that resets progress but preserves win state */}
                  <button
                    onClick={handleRestart}
                    style={{
                      marginTop: 10,
                      backgroundColor: "red",
                      color: "white",
                      border: "2px solid white",
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}>
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

      {/* Menu Modal */}
      {showMenuModal && (
        <div
          style={{
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
          }}>
          <div
            style={{
              backgroundColor: "black",
              border: "2px solid white",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}>
            {!showSounds ? (
              <>
                <div style={{ textAlign: "center" }}>MENU</div>
                <button
                  onClick={() => setShowSettings(true)}
                  style={{
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
                  onClick={() => setShowInfoModal(true)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}>
                  Briefing
                </button>
                <button
                  onClick={() => setShowTutorial(true)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}>
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
                    backgroundColor: userWon ? "black" : "gray",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: userWon ? "pointer" : "not-allowed",
                    fontFamily: "monospace",
                  }}>
                  {showCursor ? "Normal Cursor" : "Lumon pointer"}
                </button>
                <button
                  onClick={() => setShowSounds(true)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}>
                  Sounds
                </button>

                <button
                  onClick={handleRestart}
                  style={{
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
                  onClick={() => setShowMenuModal(false)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}>
                  Close Menu
                </button>
                <BuyMeACoffeeButton />
              </>
            ) : (
              <>
                <VolumeAdjuster onVolumeChange={setBgVolume} />

                <button
                  onClick={() => setMuted((prev) => !prev)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}>
                  {muted ? "Unmute" : "Mute"}
                </button>
                <button
                  onClick={() => {
                    if (userWon) {
                      setShowMusicModal(true);
                    } else {
                      setAlertMessage("");
                      setTimeout(
                        () =>
                          setAlertMessage(
                            "You have not earned that special perk yet"
                          ),
                        100
                      );
                    }
                  }}
                  style={{
                    backgroundColor: userWon ? "black" : "gray",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: userWon ? "pointer" : "not-allowed",
                    fontFamily: "monospace",
                  }}>
                  Change BG Music
                </button>
                <button
                  onClick={() => setShowSounds(false)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}>
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Music Selector Modal */}
      {showMusicModal && (
        <MusicSelectorModal
          currentTrackSrc={bgMusic}
          onMusicSelect={(newSrc: string) => setBgMusic(newSrc)}
          onClose={() => setShowMusicModal(false)}
        />
      )}

      {/* Foreground Modals */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 7000,
          }}>
          <SettingsMenu
            initialSettings={settings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}

      {showInfoModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 7000,
          }}>
          <Briefing setShowInfoModal={setShowInfoModal} />
        </div>
      )}

      {showTutorial && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 7000,
          }}>
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
