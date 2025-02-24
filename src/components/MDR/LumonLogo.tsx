import lumonWhite from "./lumon-white.png"; // adjust the path as needed

const LumonLogo = () => {
  return (
    <img
      src={lumonWhite}
      alt="Logo"
      style={{
        top: 4,
        left: 15,
        height: "150px",
        width: "230px",
        position: "relative",
      }}
    />
  );
};

export default LumonLogo;
