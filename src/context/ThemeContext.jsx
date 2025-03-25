// Пример реализации toggleTheme в ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "../axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Инициализируем тему из localStorage или по умолчанию 'light'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const userId = localStorage.getItem("id");

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Отправляем новый выбор темы на сервер
    try {
      await axios.post("/saveTheme", { userId, theme: newTheme });
    } catch (error) {
      console.error("Ошибка сохранения темы:", error);
    }
  };

  // При монтировании можно загрузить тему из localStorage (если требуется)

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
