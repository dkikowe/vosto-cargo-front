import {
  HashRouter as Router,
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
import Support from "./components/Support";
import Conf from "./components/Conf/Conf";
import PremiumSubscription from "./components/PremiumSubscription/PremiumSubscription";
import Notifications from "./components/Notifications/Notifications";
import LanguageSelector from "./components/LanguageSelector/LanguageSelector";
import Success from "./Pages/Success/Success";

function App() {
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.requestFullscreen();
    tg.disableVerticalSwipes();
    tg.ready();

    const setAppHeight = () => {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };
    setAppHeight();
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setAppHeight);
    } else {
      window.addEventListener("resize", setAppHeight);
    }

    return () => {
      tg.close(); // Закрытие веб-приложения (при необходимости)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setAppHeight);
      } else {
        window.removeEventListener("resize", setAppHeight);
      }
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
        <Route path="/support" element={<Support />} />
        <Route path="/conf" element={<Conf />} />
        <Route path="/prem" element={<PremiumSubscription />} />
        <Route path="/success" element={<Success />} />
        <Route path="/notification" element={<Notifications />} />
        <Route path="/lang" element={<LanguageSelector />} />
      </Routes>
    </Router>
  );
}

export default App;
