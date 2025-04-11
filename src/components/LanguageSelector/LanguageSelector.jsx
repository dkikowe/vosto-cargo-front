import React, { useContext, useEffect, useState } from "react";
import styles from "./LanguageSelector.module.scss";
import { useTranslation } from "react-i18next";
import axios from "../../axios";
import { ThemeContext } from "../../context/ThemeContext";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const userId = localStorage.getItem("id");
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [currentLang, setCurrentLang] = useState("en");
  const [loading, setLoading] = useState(true);

  const normalizeLang = (lang) => lang?.split("-")[0];
  const background = isDarkMode ? "#121212" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#222";
  const bgFor = isDarkMode ? "#4d4d4d" : "";

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "tg", name: "Таджикский", nativeName: "Тоҷикӣ" },
    { code: "uz", name: "Узбекский", nativeName: "Oʻzbekcha" },
    { code: "tr", name: "Турецкий", nativeName: "Türkçe" },
    { code: "zh", name: "Китайский", nativeName: "中文" },
    { code: "ru", name: "Русский", nativeName: "Русский" },
  ];

  useEffect(() => {
    const fetchUserLanguage = async () => {
      try {
        const response = await axios.get(`/getUserById/${userId}`);
        const langFromServer = response.data.language || "ru";

        const normalizedLang = normalizeLang(langFromServer);
        setCurrentLang(normalizedLang);
        i18n.changeLanguage(normalizedLang);
      } catch (error) {
        console.error("Ошибка при получении языка пользователя:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserLanguage();
    }
  }, [userId, i18n]);

  const handleLanguageChange = async (lang) => {
    if (lang === currentLang) return;

    try {
      await axios.post("/saveLang", {
        userId,
        language: lang,
      });

      i18n.changeLanguage(lang);
      setCurrentLang(lang);
    } catch (error) {
      console.error("Ошибка при смене языка:", error);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.container} style={{ backgroundColor: background }}>
      <h2 className={styles.title} style={{ color: textColor }}>
        {t("languageSelector.chooseLanguage")}
      </h2>
      <div
        className={styles.languagesGrid}
        style={{ backgroundColor: background }}
      >
        {languages.map((language) => (
          <div
            key={language.code}
            style={{ backgroundColor: bgFor }}
            className={`${styles.languageCard} ${
              language.code === normalizeLang(currentLang)
                ? styles.selected
                : ""
            }`}
            onClick={() => handleLanguageChange(language.code)}
          >
            <div className={styles.languageInfo}>
              <span
                className={styles.languageName}
                style={{ color: textColor }}
              >
                {language.name}
              </span>
              <span className={styles.nativeName} style={{ color: textColor }}>
                {language.nativeName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
