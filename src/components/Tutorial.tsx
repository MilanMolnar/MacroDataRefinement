import React, { useState } from "react";

interface HelpGuideModalProps {
  onClose: () => void;
}

const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ onClose }) => {
  const [showInDepth, setShowInDepth] = useState(false);
  const [showLayout, setShowLayout] = useState(false);

  return (
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
      onClick={onClose}>
      <div
        style={{
          backgroundColor: "black",
          padding: "20px",
          border: "2px solid white",
          maxWidth: "80vw",
          maxHeight: "80vh",
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "1rem",
          color: "white",
        }}
        onClick={(e) => e.stopPropagation()}>
        {!showInDepth ? (
          <>
            <h2>Welcome to Severance MDR Help centre</h2>
            <br />
            <p>
              In this game, you simulate severance macro data refinement work.
              For maximum enjoyment, we highly recommend that you first
              familiarize yourself with the TV show.
            </p>

            <p>
              On the left side, you’ll notice an <strong>in‑character</strong>{" "}
              briefing that explains most of your tasks in a severence - themed
              narrative style. We recommend following that briefing to uncover
              the mysterius and important work.
            </p>

            <p>
              However, if you’d prefer a straightforward explanation of the
              gameplay and controls without the TV show slang you can expand
              this guide for an in‑depth walkthrough.
            </p>
            <button
              onClick={() => setShowInDepth(true)}
              style={{
                marginTop: "20px",
                padding: "5px 10px",
                backgroundColor: "black",
                color: "white",
                border: "2px solid white",
                cursor: "pointer",
                fontFamily: "monospace",
              }}>
              Show me an in depth guide
            </button>
            <button
              onClick={() => setShowLayout(true)}
              style={{
                marginTop: "20px",
                padding: "5px 10px",
                backgroundColor: "black",
                color: "white",
                marginLeft: "10px",
                border: "2px solid white",
                cursor: "pointer",
                fontFamily: "monospace",
              }}>
              Show me the Keyboard controls
            </button>
          </>
        ) : (
          <>
            <h2>In-Depth Gameplay Guide</h2>
            <p>
              This guide explains the controls and steps needed to successfully
              play the game:
            </p>
            <ul>
              <li>
                <strong>Folder Selection:</strong>Use the scroll wheel to
                navigate between the folders. Choose the folder that exactly
                matches the file name you provided during the boot sequence.
                Only the correct folder grants access to the operational layout.
              </li>
              <br />
              <li>
                <strong>Data Refinement:</strong> Once in the main layout, you
                will see the production grid and the storage boxes at the
                bottom.<br></br>
                <strong>Your objective:</strong> is to highlight data with the
                cursor and once all static numbers within a shape are
                highlighted and the corresponding box is open, press the space
                bar to refine the data. You can open the box assigned to a shape
                you are currently hovering with the "Q" key or you can open and
                close each boxes with keys: <strong>A S D F G</strong>. When one
                box is open, a corresponding shape will pulsate red to help
                navigate you to the correct data. When you hover you cursor over
                a shape, all the numbers from that shape will be larger and stop
                wobbling. Selecting them is as easy as highlighting them with
                your cursor witout hovering to a number that is not part of the
                shape
              </li>
              <br />
              <li>
                <strong>Settings & Calibration:</strong> Access the Settings
                menu to adjust workspace dimensions, grid configurations, and
                other parameters for an optimal experience. Here you may find it
                easier if you adjust the help pulses to 2-3000 (2-3 second)
              </li>
              <br />
              <li>
                <strong>Audio & Visual Controls:</strong> Adjust background
                music volume with tilting the bar, or use the mute button to
                mute all sound effects. Toggle between a custom MDR cursor or
                standard cursor using the cursor modifier button.
              </li>
              <br />
              <li>Please try to enjoy each number equally!</li>
            </ul>
            <button
              onClick={() => setShowInDepth(false)}
              style={{
                marginTop: "20px",
                padding: "5px 10px",
                backgroundColor: "black",
                color: "white",
                border: "2px solid white",
                cursor: "pointer",
                fontFamily: "monospace",
              }}>
              Back to Overview
            </button>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            marginLeft: "10px",
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
      <div>
        {showLayout && (
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
            onClick={() => setShowLayout(false)}>
            <div
              style={{
                backgroundColor: "black",
                padding: "20px",
                border: "2px solid white",
                maxWidth: "80vw",
                maxHeight: "80vh",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "1rem",
                color: "white",
              }}
              onClick={(e) => e.stopPropagation()}>
              <h2>Controls</h2>
              <p>
                Keyboard controls are as follows:
                <ul>
                  <li>
                    <strong>Open and close each box: </strong> "A" "S" "D" "F"
                    "G" keys respectively opens Box number 1, 2, 3, 4, 5.
                  </li>
                  <li>
                    <strong>Open Currently refinable box: </strong> With the "Q"
                    key you can open the box associated with the currently
                    hovered shape.
                  </li>
                  <li>
                    <strong>Refine: </strong> With the "SPACE bar" you can
                    refine the data if properly highlighted and corresponding
                    box is Open
                  </li>
                  <li>
                    <strong>Panning grid: </strong> You can move the camera
                    around the grid wiht the "Arrow keys"
                  </li>
                  <li>
                    <strong>Zooming in/out of grid: </strong> You can zoom in
                    and out of the grid with the "Scroll wheel" with the
                    reference point being your cursor's current location.
                  </li>
                  <li>
                    <strong>Volume Adjuster: </strong> You need to grab the
                    volume adjuster and drag it up or down to adjust the volume.
                  </li>
                </ul>
              </p>
              <button
                onClick={() => setShowLayout(false)}
                style={{
                  marginTop: "20px",
                  padding: "5px 10px",
                  backgroundColor: "black",
                  color: "white",
                  border: "2px solid white",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}>
                Close Layout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpGuideModal;
