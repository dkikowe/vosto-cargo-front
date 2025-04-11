import React, { useState, useEffect, useContext } from "react";
import s from "./Company.module.sass";
import axios from "../../axios";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Company() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const userId = localStorage.getItem("id");

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
  const [companyMessage, setCompanyMessage] = useState("");

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
      setCompanyMessage(t("company.errors.noUser"));
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

      setCompanyMessage(response.data.status || t("company.success.save"));
    } catch (error) {
      console.error("Ошибка при сохранении информации о компании:", error);
      setCompanyMessage(t("company.errors.saveFailed"));
    }
  };

  return (
    <div
      className={`${s.companyContainer} ${
        theme === "dark" ? s.companyDark : s.companyLight
      }`}
    >
      <div className={s.companyInnerContainer}>
        <h2 className={s.companyTitle}>{t("company.title")}</h2>
        <form onSubmit={handleSubmit} className={s.companyForm}>
          <label className={s.companyLabel}>{t("company.name")}</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t("company.placeholders.name")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.inn")}</label>
          <input
            type="text"
            value={companyInn}
            onChange={(e) => setCompanyInn(e.target.value)}
            placeholder={t("company.placeholders.inn")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.ogrn")}</label>
          <input
            type="text"
            value={companyOgrn}
            onChange={(e) => setCompanyOgrn(e.target.value)}
            placeholder={t("company.placeholders.ogrn")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.profile")}</label>
          <input
            type="text"
            value={companyProfile}
            onChange={(e) => setCompanyProfile(e.target.value)}
            placeholder={t("company.placeholders.profile")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.country")}</label>
          <input
            type="text"
            value={companyCountry}
            onChange={(e) => setCompanyCountry(e.target.value)}
            placeholder={t("company.placeholders.country")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.city")}</label>
          <input
            type="text"
            value={companyCity}
            onChange={(e) => setCompanyCity(e.target.value)}
            placeholder={t("company.placeholders.city")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.email")}</label>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder={t("company.placeholders.email")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.website")}</label>
          <input
            type="text"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder={t("company.placeholders.website")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.manager")}</label>
          <input
            type="text"
            value={companyManager}
            onChange={(e) => setCompanyManager(e.target.value)}
            placeholder={t("company.placeholders.manager")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.phone")}</label>
          <input
            type="text"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder={t("company.placeholders.phone")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.jobTitle")}</label>
          <input
            type="text"
            value={companyJobTitle}
            onChange={(e) => setCompanyJobTitle(e.target.value)}
            placeholder={t("company.placeholders.jobTitle")}
            className={s.companyInput}
          />

          <label className={s.companyLabel}>{t("company.department")}</label>
          <input
            type="text"
            value={companyDepartment}
            onChange={(e) => setCompanyDepartment(e.target.value)}
            placeholder={t("company.placeholders.department")}
            className={s.companyInput}
          />

          <button type="submit" className={s.companySaveButton}>
            {t("company.save")}
          </button>
        </form>
        {companyMessage && <p className={s.companyMessage}>{companyMessage}</p>}
      </div>
    </div>
  );
}
