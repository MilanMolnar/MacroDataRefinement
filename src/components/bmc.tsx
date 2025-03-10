import React from "react";
import coffeeIcon from "../assets/bmc.png"; // Replace with your icon's path

const BuyMeACoffeeButton: React.FC = () => {
  return (
    <a
      href="https://buymeacoffee.com/milanmolnar"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        border: "2px solid #000000",
        borderRadius: "12px", // Increased rounded corners
        padding: "6px 5px",
        textDecoration: "none",
        fontFamily: "'Cookie', cursive",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        transition: "background-color 0.3s ease, transform 0.2s ease",
        zIndex: 25000,
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
          "#FFDD00";
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
          "#ffffff";
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
      }}>
      <img
        src={coffeeIcon}
        alt="Coffee Icon"
        style={{
          height: "1.5rem",
          width: "1.5rem",
          borderRadius: "8px", // Rounded corners for the icon
          marginRight: "8px",
        }}
      />
      Support the creator
    </a>
  );
};

export default BuyMeACoffeeButton;
