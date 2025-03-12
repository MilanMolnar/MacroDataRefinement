import React from "react";

interface CustomAlertProps {
  message: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message }) => {
  return (
    <>
      <style>{`
        @keyframes alertAnimation {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(10px);
          }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100000,

          pointerEvents: "none",
        }}>
        <div
          style={{
            border: "2px double #acecfc",
            padding: "17px 25px",
            fontSize: "1.3rem",

            color: "#acecfc",
            textAlign: "center",
            fontFamily: "monospace",
            backgroundColor: "black",
            justifyContent: "center",
            animation: "alertAnimation 2s ease-in-out forwards",
          }}>
          {message}
        </div>
      </div>
    </>
  );
};

export default CustomAlert;
