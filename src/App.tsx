import React from "react";
import HingedFolders from "./components/HingedFolders";
import SeveranceMDRLayout from "./components/MDR/Layout";


const App: React.FC = () => {
  return (
    <div className="App">
      <SeveranceMDRLayout headerText="Slena" percentage={""}></SeveranceMDRLayout>
      <HingedFolders></HingedFolders>
    </div>
  );
};

export default App;