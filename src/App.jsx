import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Nav from "./components/NavMenu/Nav";
import Cabinet from "./Pages/Cabinet/Cabinet";
import Start from "./Pages/Start/Start";
import Create from "./Pages/Create/Create";
import Company from "./Pages/Company/Company";
import { Main } from "./Pages/Main/Main";
import CalculatorPopup from "./components/Calculator/Calculator";

function App() {
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    // tg.requestFullscreen();
    tg.disableVerticalSwipes();
    tg.ready();

    return () => {
      tg.close(); // Закрытие веб-приложения (при необходимости)
    };
  }, []);
  return (
    <Router>
      <Header />
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/start" element={<Start />} />
        <Route path="/menu" element={<Cabinet />} />
        <Route path="/create" element={<Create />} />
        <Route path="/company" element={<Company />} />
        <Route path="/home" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
