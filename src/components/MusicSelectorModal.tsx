import React, { useState } from "react";
import defaultMusic from "../assets/sounds/music.mp3";
import Initiate_refinement from "../assets/sounds/Initiate_refinement.mp3";
import Music_dance_exp from "../assets/sounds/Music_dance_exp.mp3";
import Mdr_file_assignment from "../assets/sounds/MDR_file_assignment.mp3";

interface MusicTrack {
  id: string;
  name: string;
  src: string;
}

interface MusicSelectorModalProps {
  currentTrackSrc: string;
  onMusicSelect: (src: string) => void;
  onClose: () => void;
}

const MusicSelectorModal: React.FC<MusicSelectorModalProps> = ({
  currentTrackSrc,
  onMusicSelect,
  onClose,
}) => {
  // Define available music tracks using imported files.
  const tracks: MusicTrack[] = [
    { id: "default", name: "Default Music", src: defaultMusic },
    {
      id: "Initiate_refinement",
      name: "Initiate Refinement",
      src: Initiate_refinement,
    },
    {
      id: "Music_dance_exp",
      name: "Music Dance Experience",
      src: Music_dance_exp,
    },
    {
      id: "MDR_file_assignment",
      name: "MDR File Assignment",
      src: Mdr_file_assignment,
    },
  ];

  const [selectedTrack, setSelectedTrack] = useState<string>(currentTrackSrc);

  const handleApply = () => {
    onMusicSelect(selectedTrack);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 8000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
        <h2 style={{ color: "white", fontFamily: "monospace" }}>
          Select Background Music
        </h2>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          style={{
            padding: "5px 10px",
            fontFamily: "monospace",
            border: "2px solid white",
            backgroundColor: "black",
            color: "white",
          }}>
          {tracks.map((track) => (
            <option key={track.id} value={track.src}>
              {track.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleApply}
          style={{
            backgroundColor: "black",
            color: "white",
            border: "2px solid white",
            padding: "5px 10px",
            cursor: "pointer",
            fontFamily: "monospace",
          }}>
          Apply
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "black",
            color: "white",
            border: "2px solid white",
            padding: "5px 10px",
            cursor: "pointer",
            fontFamily: "monospace",
          }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MusicSelectorModal;
