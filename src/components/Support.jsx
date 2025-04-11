import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import styles from "./Support.module.scss";
import { ChevronLeft } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const Support = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
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
      } else {
        alert(t("support.errorSend"));
      }
    } catch (error) {
      console.error("Ошибка при отправке:", error);
      alert(t("support.errorUnknown"));
    }
  };

  const darkStyles = {
    backgroundColor: "#000",
    color: "#fff",
  };

  const inputDark = {
    backgroundColor: "#000",
    color: "#fff",
    border: "1px solid #fff",
  };

  return (
    <div
      className={styles.supportContainer}
      style={theme === "dark" ? darkStyles : {}}
    >
      <div className={styles.header} style={theme === "dark" ? darkStyles : {}}>
        <ChevronLeft
          onClick={() => navigate("/menu")}
          style={theme === "dark" ? { color: "#fff" } : {}}
        />
        <h2 className={styles.title}>{t("support.title")}</h2>
      </div>

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
            style={theme === "dark" ? inputDark : {}}
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
            style={theme === "dark" ? inputDark : {}}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          {t("support.submit")}
        </button>
      </form>
    </div>
  );
};

export default Support;
