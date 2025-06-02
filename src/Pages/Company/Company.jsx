import React, { useState, useEffect, useContext } from "react";
import s from "./Company.module.sass";
import axios from "../../axios";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import CompanyPopup from "./CompanyPopup";

export default function Company() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const userId = localStorage.getItem("id");

  const [companyData, setCompanyData] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/getCompany/${userId}`)
      .then((res) => {
        if (res.data && res.data.company) {
          setCompanyData(res.data.company);
        }
      })
      .catch((err) => {
        console.error("Ошибка при получении данных о компании:", err);
      });
  }, [userId]);

  return (
    <div
      className={`${s.companyContainer} ${
        theme === "dark" ? s.companyDark : s.companyLight
      }`}
    >
      <div className={s.companyInnerContainer}>
        <h2 className={s.companyTitle}>{t("company.title")}</h2>
        <button
          className={s.companySaveButton}
          onClick={() => setPopupOpen(true)}
        >
          {companyData
            ? t("Редактировать компанию")
            : t("Зарегистрировать компанию")}
        </button>
        {popupOpen && (
          <CompanyPopup
            onClose={() => setPopupOpen(false)}
            userId={userId}
            initialData={companyData}
          />
        )}
      </div>
    </div>
  );
}
