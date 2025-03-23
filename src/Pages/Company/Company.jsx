import React, { useState, useEffect, useContext } from "react";
import s from "./Company.module.sass";
import axios from "../../axios";
import { ThemeContext } from "../../context/ThemeContext"; // Импортируем контекст темы

export default function Company() {
  const { theme } = useContext(ThemeContext);
  const userId = localStorage.getItem("id");

  // Состояния для всех полей компании
  const [name, setName] = useState("");
  const [inn, setInn] = useState("");
  const [ogrn, setOgrn] = useState("");
  const [profile, setProfile] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");

  // Для вывода сообщения об успехе или ошибке
  const [message, setMessage] = useState("");

  // При монтировании компонента, если есть userId, получаем текущую информацию о компании
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/getCompany/${userId}`)
      .then((res) => {
        if (res.data && res.data.company) {
          const comp = res.data.company;
          setName(comp.name || "");
          setInn(comp.inn || "");
          setOgrn(comp.ogrn || "");
          setProfile(comp.profile || "");
          setCountry(comp.country || "");
          setCity(comp.city || "");
          setEmail(comp.email || "");
          setWebsite(comp.website || "");
          setManager(comp.manager || "");
          setPhone(comp.phone || "");
          setJobTitle(comp.jobTitle || "");
          setDepartment(comp.department || "");
        }
      })
      .catch((err) => {
        console.error("Ошибка при получении данных о компании:", err);
      });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setMessage("Пользователь не найден (нет ID в localStorage)");
      return;
    }
    try {
      // Собираем данные в объект
      const payload = {
        userId,
        name,
        inn,
        ogrn,
        profile,
        country,
        city,
        email,
        website,
        manager,
        phone,
        jobTitle,
        department,
      };

      // Отправляем POST-запрос на эндпоинт для обновления компании
      const response = await axios.post("/updateCompany", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage(response.data.status || "Информация о компании сохранена");
    } catch (error) {
      console.error("Ошибка при сохранении информации о компании:", error);
      setMessage("Ошибка при сохранении информации");
    }
  };

  return (
    // Применяем классы в зависимости от выбранной темы
    <div className={`${s.container} ${theme === "dark" ? s.dark : s.light}`}>
      <div className={s.innerContainer}>
        <h2>Информация о компании</h2>
        <form onSubmit={handleSubmit} className={s.form}>
          <label>Название компании</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название"
          />
          <label>ИНН</label>
          <input
            type="text"
            value={inn}
            onChange={(e) => setInn(e.target.value)}
            placeholder="Введите ИНН"
          />
          <label>ОГРН</label>
          <input
            type="text"
            value={ogrn}
            onChange={(e) => setOgrn(e.target.value)}
            placeholder="Введите ОГРН"
          />
          <label>Профиль</label>
          <input
            type="text"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Например, экспедитор-перевозчик"
          />
          <label>Страна</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Страна"
          />
          <label>Город</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Город"
          />
          <label>Почта</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.ru"
          />
          <label>Сайт</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
          <label>Руководитель</label>
          <input
            type="text"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            placeholder="Иванов Иван Иванович"
          />
          <label>Телефон</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
          />
          <label>Должность</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Должность руководителя"
          />
          <label>Подразделение</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Например, главный офис"
          />
          <button type="submit" className={s.saveButton}>
            Сохранить
          </button>
        </form>
        {message && <p className={s.message}>{message}</p>}
      </div>
    </div>
  );
}
