
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import GridPage from "./components/GridPage.tsx";
import Shader1Page from "./components/Shader1Page.tsx";
import Shader2Page from "./components/Shader2Page.tsx";
import Shader3Page from "./components/Shader3Page.tsx";
import Shader4Page from "./components/Shader4Page.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Router>
    <Routes>
      <Route path="/" element={<GridPage />} />
      <Route path="/shader1" element={<Shader1Page />} />
      <Route path="/shader2" element={<Shader2Page />} />
      <Route path="/shader3" element={<Shader3Page />} />
      <Route path="/shader4" element={<Shader4Page />} />
      {/* Keep the old App for embed functionality */}
      <Route path="/embed" element={<App />} />
    </Routes>
  </Router>
);
  