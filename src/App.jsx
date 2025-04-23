import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
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

function RedirectByStartParam() {
  const navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.requestFullscreen();
    tg.disableVerticalSwipes();
    tg.ready();

    const param = tg.initDataUnsafe?.start_param;

    if (param === "calculator")
      navigate("/home"); // или "/calculator" если есть
    else if (param === "support") navigate("/support");
    else if (param === "conf") navigate("/conf");
    else if (param === "prem") navigate("/prem");
    else if (param === "notification") navigate("/notification");
    else if (param === "lang") navigate("/lang");
    else if (param === "create") navigate("/create");
    else if (param === "company") navigate("/company");
    else navigate("/home"); // fallback
  }, [navigate]);

  return null; // этот компонент не рендерит ничего
}

function App() {
  return (
    <Router>
      <RedirectByStartParam />
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
        <Route path="/notification" element={<Notifications />} />
        <Route path="/lang" element={<LanguageSelector />} />
      </Routes>
    </Router>
  );
}

export default App;
