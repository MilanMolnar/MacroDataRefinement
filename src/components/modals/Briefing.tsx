interface Props {
  setShowInfoModal: (value: boolean) => void;
}

const Briefing = ({ setShowInfoModal }: Props) => {
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
          Welcome to Lumon Industries. Your severance is approved. You are now
          entering a controlled simulation where every folder is a critical
          directive. Compliance is paramount.
        </p>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>Help and settings</strong> You can access the main menu by
          pressing the 'Esc' key on you Lumon issued keypad. Here you can change
          settings, get help and use your special perks.
        </p>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>Operational Directive:</strong> Select the folder that exactly
          matches the file name provided at boot. Only an exact match will
          authorize your operation.
        </p>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>Procedure & Execution:</strong> Your simulation proceeds in
          three phases: identity confirmation via the Boot Screen, precise
          folder selection, and production grid data refinement. Every phase is
          monitored for precision.
        </p>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>How to Operate:</strong> Use keys A–G to open storage boxes.
          If you find data first, press Q. With a box open and data selected,
          hit the spacebar to refine, then close the box with its designated
          key. Precision is required.
        </p>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>Assistance:</strong> If hesitation or inactivity is detected,
          automated help pulses will guide you.
        </p>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>Settings & Calibration:</strong> Adjust workspace dimensions,
          grid configuration, and help intervals via the Settings menu to
          maintain system integrity and peak performance.
        </p>

        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}>
          <strong>Custom Interaction:</strong> Pressing the 'Esc' key will bring
          up a menu where you can change setting or use your perks when a file
          is refined.
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
  );
};

export default Briefing;
