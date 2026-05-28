// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppContent from "./AppContent";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
