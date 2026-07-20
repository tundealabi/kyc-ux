import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { KycProvider } from "./state/KycContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <KycProvider>
        <App />
      </KycProvider>
    </BrowserRouter>
  </StrictMode>,
);
