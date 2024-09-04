import Fooder from "./components/Fooder";
import Header from "./components/Header";
import Main from "./components/Main";
import React from "react";
import { createRoot } from "react-dom/client";

createRoot(document.querySelector("#content")).render(<App />);
function App() {
  return (
    <div>
        <Header />
        <Main />
        <Fooder />
    </div>
  );
}

export default App;
