import React from "react";

interface ModalProps {
  onClose?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
}

const defaultOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 6000,
};

const defaultContentStyle: React.CSSProperties = {
  backgroundColor: "black",
  border: "2px solid white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const Modal: React.FC<ModalProps> = ({
  onClose,
  children,
  style,
  overlayStyle,
}) => {
  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  return (
    <div
      style={{ ...defaultOverlayStyle, ...overlayStyle }}
      onClick={handleOverlayClick}>
      <div
        style={{ ...defaultContentStyle, ...style }}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
