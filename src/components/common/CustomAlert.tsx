import React from "react";

interface CustomAlertProps {
  message: string;
  /** When true, positions the alert absolutely within its nearest positioned
   *  ancestor (i.e. inside the game view) instead of fixed over the viewport. */
  contained?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, contained = false }) => {
  return (
    <>
      <style>{`
        @keyframes alertAnimation {
          0%   { opacity: 0; transform: translateY(-12px); }
          20%  { opacity: 1; transform: translateY(0);     }
          80%  { opacity: 1; transform: translateY(0);     }
          100% { opacity: 0; transform: translateY(8px);   }
        }
      `}</style>
      <div
        style={
          contained
            ? {
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 100000,
                pointerEvents: "none",
              }
            : {
                position: "fixed",
                top: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 100000,
                pointerEvents: "none",
              }
        }>
        <div
          style={{
            border: "2px double #acecfc",
            padding: "12px 20px",
            fontSize: "0.9rem",
            color: "#acecfc",
            textAlign: "center",
            fontFamily: "monospace",
            backgroundColor: "black",
            animation: "alertAnimation 1.4s ease-in-out forwards",
          }}>
          {message}
        </div>
      </div>
    </>
  );
};

export default CustomAlert;
