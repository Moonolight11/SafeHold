import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";

const App: React.FC = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const tg = (window as any).Telegram.WebApp;
    tg.expand();
    tg.ready();
    setTheme(tg.colorScheme || "dark");
    tg.HapticFeedback.impactOccurred("light");
    setUser(tg.initDataUnsafe?.user || null);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 ${theme}`}>
      <h1 className="text-3xl font-bold text-neon-blue">🔐 SafeHold</h1>
      <p className="text-neon-green">Secure P2P Escrow</p>
      <div className="mt-4 glass p-4 rounded-2xl backdrop-blur-md border border-white/10">
        <p>User: @{user?.username || "guest"}</p>
      </div>
    </div>
  );
};

export default App;
