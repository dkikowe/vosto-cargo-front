import React, { useState, useEffect, useContext } from "react";
import s from "./Company.module.sass";
import axios from "../../axios";
import { ThemeContext } from "../../context/ThemeContext"; // Импортируем контекст темы

export default function Company() {
  const { theme } = useContext(ThemeContext);
  const userId = localStorage.getItem("id");

  // Состояния для всех полей компании
  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [companyOgrn, setCompanyOgrn] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyManager, setCompanyManager] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyJobTitle, setCompanyJobTitle] = useState("");
  const [companyDepartment, setCompanyDepartment] = useState("");

  // Сообщение об успехе или ошибке
  const [companyMessage, setCompanyMessage] = useState("");

  // Получаем информацию о компании при монтировании
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/getCompany/${userId}`)
      .then((res) => {
        if (res.data && res.data.company) {
          const comp = res.data.company;
          setCompanyName(comp.name || "");
          setCompanyInn(comp.inn || "");
          setCompanyOgrn(comp.ogrn || "");
          setCompanyProfile(comp.profile || "");
          setCompanyCountry(comp.country || "");
          setCompanyCity(comp.city || "");
          setCompanyEmail(comp.email || "");
          setCompanyWebsite(comp.website || "");
          setCompanyManager(comp.manager || "");
          setCompanyPhone(comp.phone || "");
          setCompanyJobTitle(comp.jobTitle || "");
          setCompanyDepartment(comp.department || "");
        }
      })
      .catch((err) => {
        console.error("Ошибка при получении данных о компании:", err);
      });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setCompanyMessage("Пользователь не найден (нет ID в localStorage)");
      return;
    }
    try {
      const payload = {
        userId,
        name: companyName,
        inn: companyInn,
        ogrn: companyOgrn,
        profile: companyProfile,
        country: companyCountry,
        city: companyCity,
        email: companyEmail,
        website: companyWebsite,
        manager: companyManager,
        phone: companyPhone,
        jobTitle: companyJobTitle,
        department: companyDepartment,
      };

      const response = await axios.post("/updateCompany", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setCompanyMessage(
        response.data.status || "Информация о компании сохранена"
      );
    } catch (error) {
      console.error("Ошибка при сохранении информации о компании:", error);
      setCompanyMessage("Ошибка при сохранении информации");
    }
  };

  return (
    <div
      className={`${s.companyContainer} ${
        theme === "dark" ? s.companyDark : s.companyLight
      }`}
    >
      <div className={s.companyInnerContainer}>
        <h2 className={s.companyTitle}>Информация о компании</h2>
        <form onSubmit={handleSubmit} className={s.companyForm}>
          <label className={s.companyLabel}>Название компании</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Введите название"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>ИНН</label>
          <input
            type="text"
            value={companyInn}
            onChange={(e) => setCompanyInn(e.target.value)}
            placeholder="Введите ИНН"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>ОГРН</label>
          <input
            type="text"
            value={companyOgrn}
            onChange={(e) => setCompanyOgrn(e.target.value)}
            placeholder="Введите ОГРН"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Профиль</label>
          <input
            type="text"
            value={companyProfile}
            onChange={(e) => setCompanyProfile(e.target.value)}
            placeholder="Например, экспедитор-перевозчик"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Страна</label>
          <input
            type="text"
            value={companyCountry}
            onChange={(e) => setCompanyCountry(e.target.value)}
            placeholder="Страна"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Город</label>
          <input
            type="text"
            value={companyCity}
            onChange={(e) => setCompanyCity(e.target.value)}
            placeholder="Город"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Почта</label>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="example@mail.ru"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Сайт</label>
          <input
            type="text"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="https://example.com"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Руководитель</label>
          <input
            type="text"
            value={companyManager}
            onChange={(e) => setCompanyManager(e.target.value)}
            placeholder="Иванов Иван Иванович"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Телефон</label>
          <input
            type="text"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Должность</label>
          <input
            type="text"
            value={companyJobTitle}
            onChange={(e) => setCompanyJobTitle(e.target.value)}
            placeholder="Должность руководителя"
            className={s.companyInput}
          />

          <label className={s.companyLabel}>Подразделение</label>
          <input
            type="text"
            value={companyDepartment}
            onChange={(e) => setCompanyDepartment(e.target.value)}
            placeholder="Например, главный офис"
            className={s.companyInput}
          />

          <button type="submit" className={s.companySaveButton}>
            Сохранить
          </button>
        </form>
        {companyMessage && <p className={s.companyMessage}>{companyMessage}</p>}
      </div>
    </div>
  );
}
