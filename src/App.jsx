import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Nav from "./components/NavMenu/Nav";
import Cabinet from "./Pages/Cabinet/Cabinet";

function App() {
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.requestFullscreen();
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
        <Route path="/" element={<Cabinet />} />
      </Routes>
    </Router>
  );
}

export default App;
