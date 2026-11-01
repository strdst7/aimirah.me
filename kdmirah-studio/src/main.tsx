import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@aimirah/shared/ErrorBoundary";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary label="kdmirah.studio">
      <App />
    </ErrorBoundary>
  </StrictMode>
);
