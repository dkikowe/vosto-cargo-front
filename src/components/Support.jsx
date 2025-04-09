import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import styles from "./Support.module.scss";
import { ChevronLeft } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();
  const initData = window.Telegram.WebApp.initData;

  // const initData =
  // "user=%7B%22id%22%3A5056024242%2C%22first_name%22%3A%22%3C%5C%2Fabeke%3E%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22abylaikak%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAj3hfrbNq8PfLLKvsSp3-WizcXTc3HO8Vynsw3R1a1A5spK3fDmZERABNoOGLEQN.svg%22%7D&chat_instance=-4908992446394523843&chat_type=private&auth_date=1735556539&signature=pgNJfzcxYGAcJCJ_jnsYEsmiTJJxOP2tNKb941-fT7QcsUQ2chSkFcItG8KvjR_r3nH0vem4bxtlltuyX-IwBQ&hash=c0b510163f5b1dea53172644df35e63458216a9d5d9a10413af4f5b0204bb493";

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
        alert("Обращение отправлено");
        setTitle("");
        setDescription("");
      } else {
        alert("Ошибка при отправке обращения");
      }
    } catch (error) {
      console.error("Ошибка при отправке:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    }
  };

  return (
    <div className={styles.supportContainer}>
      <div className={styles.header}>
        <ChevronLeft onClick={() => navigate("/menu")} />
        <h2 className={styles.title}>Техническая поддержка</h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="title">Тема обращения</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите тему обращения"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="description">Описание проблемы</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите вашу проблему подробно"
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Отправить
        </button>
      </form>
    </div>
  );
};

export default Support;
