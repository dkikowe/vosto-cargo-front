import React, { useState, useEffect, useContext } from "react";
import axios from "../axios";
import styles from "./Support.module.scss";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const SupportPopup = ({ onClose, theme, t }) => {
  const initData = window.Telegram.WebApp.initData;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    try {
      if (initData) {
        const params = new URLSearchParams(initData);
        const userData = params.get("user");
        if (userData) {
          const userObj = JSON.parse(decodeURIComponent(userData));
          if (userObj.username) {
            setUsername("@" + userObj.username);
          } else if (userObj.first_name) {
            setUsername(userObj.first_name);
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при парсинге initData:", error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/support", {
        title,
        description,
        username,
      });
      if (response.data.ok) {
        alert(t("support.success"));
        setTitle("");
        setDescription("");
        onClose && onClose();
      } else {
        alert(t("support.errorSend"));
      }
    } catch (error) {
      console.error("Ошибка при отправке:", error);
      alert(t("support.errorUnknown"));
    }
  };

  return (
    <div className={`${styles.overlay} ${theme === "dark" ? styles.dark : ""}`}>
      <div className={styles.bottomSheetPopup}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>{t("support.title")}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">{t("support.subject")}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("support.subjectPlaceholder")}
              required
              style={
                theme === "dark"
                  ? {
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "1px solid #fff",
                    }
                  : {}
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description">{t("support.description")}</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("support.descriptionPlaceholder")}
              required
              style={
                theme === "dark"
                  ? {
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "1px solid #fff",
                    }
                  : {}
              }
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            {t("support.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPopup;
