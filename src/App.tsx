// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppContent from "./AppContent";
import { ScrollToTop } from "./components/ScrollToTop";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
