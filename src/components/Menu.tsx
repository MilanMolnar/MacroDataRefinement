import React from "react";
import VolumeAdjuster from "./MDR/VolumeAdjuster";
import BuyMeACoffeeButton from "./bmc";
import Modal from "./common/Modal";
import Button from "./common/Button";

interface MenuModalProps {
  showSounds: boolean;
  userWon: boolean;
  showCursor: boolean;
  muted: boolean;
  onSetShowSettings: () => void;
  onSetShowInfoModal: () => void;
  onSetShowTutorial: () => void;
  onToggleCursor: () => void;
  onSetShowSounds: (value: boolean) => void;
  onRestart: () => void;
  onClose: () => void;
  onCopyShareMessage: () => void;
  onSetShowMusicModal: () => void;
  onToggleMuted: () => void;
  onVolumeChange: (value: number) => void;
  setAlertMessage: (message: string) => void;
}

const MenuModal: React.FC<MenuModalProps> = ({
  showSounds,
  userWon,
  showCursor,
  muted,
  onSetShowSettings,
  onSetShowInfoModal,
  onSetShowTutorial,
  onToggleCursor,
  onSetShowSounds,
  onRestart,
  onClose,
  onCopyShareMessage,
  onSetShowMusicModal,
  onToggleMuted,
  onVolumeChange,
  setAlertMessage,
}) => {
  return (
    <Modal
      onClose={onClose}
      overlayStyle={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 6000 }}>
      {!showSounds ? (
        <>
          <div style={{ textAlign: "center" }}>MENU</div>
          <Button
            onClick={onSetShowSettings}
            style={{ backgroundColor: userWon ? "green" : "black" }}>
            Settings
          </Button>
          <Button onClick={onSetShowInfoModal}>Briefing</Button>
          <Button onClick={onSetShowTutorial}>I need help!</Button>
          <Button
            onClick={() => {
              if (userWon) {
                onToggleCursor();
              } else {
                setAlertMessage("You have not earned that special perk yet");
                setTimeout(() => setAlertMessage(""), 2000);
              }
            }}
            style={{
              backgroundColor: userWon ? "green" : "gray",
              cursor: userWon ? "pointer" : "not-allowed",
            }}>
            {showCursor ? "Normal Cursor" : "Lumon pointer"}
          </Button>
          <Button
            onClick={() => onSetShowSounds(true)}
            style={{ backgroundColor: userWon ? "green" : "black" }}>
            Sounds & Music
          </Button>
          <Button onClick={onRestart}>Restart</Button>
          <Button onClick={onClose}>Close Menu</Button>
          <Button
            onClick={() => {
              onCopyShareMessage();
              const shareMessage = `Try out the most realistic Lumon MDR simulator, and make Kier proud. Link: ${window.location.href}`;
              if (navigator.share) {
                navigator
                  .share({
                    title: "Lumon Message",
                    text: shareMessage,
                    url: window.location.href,
                  })
                  .catch((error) => console.log("Error sharing:", error));
              } else {
                alert("Share feature is not supported in this browser.");
              }
            }}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "6px 10px",
            }}>
            Share with your innies!
          </Button>
          <BuyMeACoffeeButton />
        </>
      ) : (
        <>
          <VolumeAdjuster onVolumeChange={onVolumeChange} />
          <Button onClick={onToggleMuted}>{muted ? "Unmute" : "Mute"}</Button>
          <Button
            onClick={() => {
              if (userWon) {
                onSetShowMusicModal();
              } else {
                setAlertMessage("You have not earned that special perk yet");
                setTimeout(() => setAlertMessage(""), 100);
              }
            }}
            style={{
              backgroundColor: userWon ? "green" : "gray",
              cursor: userWon ? "pointer" : "not-allowed",
            }}>
            Change Music Box
          </Button>
          <Button onClick={() => onSetShowSounds(false)}>Back</Button>
        </>
      )}
    </Modal>
  );
};

export default MenuModal;
