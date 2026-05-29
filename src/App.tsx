// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppContent from "./AppContent";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthSessionOverlay from "./components/AuthSessionOverlay";

function AuthTransitionPortal() {
  const { authTransition } = useAuth();
  if (!authTransition) return null;
  return <AuthSessionOverlay state={authTransition} />;
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthTransitionPortal />
        <ScrollToTop />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
