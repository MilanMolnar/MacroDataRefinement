import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "white";
}

const baseStyle: React.CSSProperties = {
  border: "2px solid white",
  padding: "5px 10px",
  cursor: "pointer",
  fontFamily: "monospace",
  color: "white",
  backgroundColor: "black",
};

const variantStyles: { [key: string]: React.CSSProperties } = {
  primary: { backgroundColor: "black" },
  secondary: { backgroundColor: "gray" },
  danger: { backgroundColor: "red" },
  white: { backgroundColor: "white", color: "black", padding: "6px 10px" },
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  style,
  ...props
}) => {
  const finalStyle = { ...baseStyle, ...variantStyles[variant], ...style };
  return <button style={finalStyle} {...props} />;
};

export default Button;
