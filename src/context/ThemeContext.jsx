import React, { createContext, useState, useEffect } from "react";
import axios from "../axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const userId = localStorage.getItem("id");
  // Начинаем со значения из localStorage или по умолчанию 'light'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // При монтировании загружаем тему с сервера для пользователя, если userId есть
  useEffect(() => {
    if (userId) {
      axios
        .get(`/getUserById/${userId}`)
        .then((res) => {
          if (res.data && res.data.theme) {
            setTheme(res.data.theme);
            localStorage.setItem("theme", res.data.theme);
          }
        })
        .catch((error) =>
          console.error("Ошибка получения данных пользователя:", error)
        );
    }
  }, [userId]);

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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
