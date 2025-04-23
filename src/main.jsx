import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import "./i18n";

window.onload = () => {
  setTimeout(() => {
    if (!window.location.hash || window.location.hash === "#/") {
      window.location.replace(window.location.origin + "/#/home");
    }
  }, 100);
};

ReactDOM.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
