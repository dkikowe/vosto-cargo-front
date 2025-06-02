import React, { useState, useContext } from "react";
import s from "./CompanyPopup.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import BottomSheetModal from "../Create/components/BottomSheetModal";

const steps = ["Основная информация", "Профиль и местоположение", "Контакты"];

export default function CompanyPopup({ onClose, userId, initialData }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: initialData?.name || "",
    inn: initialData?.inn || "",
    ogrn: initialData?.ogrn || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    profile: initialData?.profile || "",
    country: initialData?.country || "",
    city: initialData?.city || "",
    manager: initialData?.manager || "",
    phone: initialData?.phone || "",
    jobTitle: initialData?.jobTitle || "",
    department: initialData?.department || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Здесь должен быть axios/post, как в оригинале
    setTimeout(() => {
      setLoading(false);
      setMessage("Сохранено!");
      setTimeout(() => setMessage(""), 2000);
      onClose();
    }, 1000);
  };

  return (
    <BottomSheetModal visible={true} onClose={onClose}>
      <form className={s.companyForm} onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 20 }}>Данные компании</div>
          <div style={{ color: "#888", fontSize: 15, margin: "8px 0" }}>
            Шаг {step + 1} из 3: {steps[step]}
          </div>
          <div
            style={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              margin: "12px 0",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 4,
                  borderRadius: 2,
                  width: 60,
                  background: i <= step ? "#3a5c9f" : "#e0e0e0",
                }}
              />
            ))}
          </div>
        </div>
        {step === 0 && (
          <>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Название компании"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                name="inn"
                value={form.inn}
                onChange={handleChange}
                placeholder="ИНН"
                className={s.companyInput}
                style={{ flex: 1 }}
              />
              <input
                name="ogrn"
                value={form.ogrn}
                onChange={handleChange}
                placeholder="ОГРН"
                className={s.companyInput}
                style={{ flex: 1 }}
              />
            </div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="Сайт"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
          </>
        )}
        {step === 1 && (
          <>
            <input
              name="profile"
              value={form.profile}
              onChange={handleChange}
              placeholder="Профиль компании"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Страна"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Город"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
          </>
        )}
        {step === 2 && (
          <>
            <input
              name="manager"
              value={form.manager}
              onChange={handleChange}
              placeholder="ФИО руководителя"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Телефон"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <input
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="Должность"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Отдел"
              className={s.companyInput}
              style={{ marginBottom: 8 }}
            />
          </>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {step > 0 && (
            <button
              type="button"
              onClick={prev}
              className={s.companyInput}
              style={{
                background: "#f5f5f5",
                color: "#3a5c9f",
                border: "1px solid #3a5c9f",
              }}
            >
              ←
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className={s.companyInput}
              style={{ background: "#3a5c9f", color: "#fff" }}
            >
              Далее
            </button>
          ) : (
            <button
              type="submit"
              className={s.companyInput}
              style={{ background: "#3a5c9f", color: "#fff" }}
              disabled={loading}
            >
              {loading ? "Сохраняю..." : "Сохранить"}
            </button>
          )}
        </div>
        {message && <div className={s.companyMessage}>{message}</div>}
      </form>
    </BottomSheetModal>
  );
}
