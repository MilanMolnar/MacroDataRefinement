import React from "react";
import coffeeIcon from "../assets/bmc.png"; // Replace with your icon's path

const BuyMeACoffeeButton: React.FC = () => {
  return (
    <a
      href="https://buymeacoffee.com/milanmolnar"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        backgroundColor: "#ffffff",
        color: "#000000",
        border: "2px solid #000000",
        borderRadius: "12px", // Increased rounded corners
        padding: "10px 15px",
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
      Buy me a coffee
    </a>
  );
};

export default BuyMeACoffeeButton;
