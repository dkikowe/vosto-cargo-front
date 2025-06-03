import React, { useState, useContext, useRef, useEffect } from "react";
import s from "./CompanyPopup.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import BottomSheetModal from "../Create/components/BottomSheetModal";
import AvatarEditor from "react-avatar-editor";
import axios from "../../axios";

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
  const [companyPhoto, setCompanyPhoto] = useState(initialData?.photo || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    setCompanyPhoto(initialData?.photo || "");
  }, [initialData]);

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleSavePhoto = async () => {
    if (!editor) return;
    setPhotoLoading(true);
    const canvas = editor.getImageScaledToCanvas();
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("photo", blob, "company.png");
      try {
        const response = await axios.post(
          `/uploadCompanyPhoto/${userId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.data && response.data.photo) {
          setCompanyPhoto(response.data.photo);
        } else {
          // fallback: обновить по url
          setCompanyPhoto(URL.createObjectURL(blob));
        }
      } catch (error) {
        alert("Ошибка при загрузке фото компании");
      } finally {
        setPhotoLoading(false);
        setSelectedFile(null);
      }
    });
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
          {/* Фото компании */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="company-photo-upload"
              style={{
                cursor: "pointer",
                display: "inline-block",
                position: "relative",
              }}
            >
              {selectedFile ? (
                <div className={s.overlay}>
                  <div className={s.editorContainer}>
                    <AvatarEditor
                      ref={setEditor}
                      image={selectedFile}
                      width={97}
                      height={97}
                      border={50}
                      borderRadius={50}
                      scale={scale}
                      className={s.divAvatar}
                    />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                    />
                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      className={s.saveButton}
                      disabled={photoLoading}
                    >
                      {photoLoading ? "Сохраняю..." : "Сохранить фото"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={companyPhoto || "/images/cabinet-icons/photo.svg"}
                    alt="company"
                    style={{
                      width: 97,
                      height: 97,
                      borderRadius: "50%",
                      objectFit: "cover",
                      background: "#f5f5f5",
                    }}
                  />
                  <img
                    src="/images/design-icons-cab/photos.svg"
                    alt=""
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      width: 24,
                      height: 24,
                    }}
                  />
                  <input
                    type="file"
                    hidden
                    id="company-photo-upload"
                    onChange={handlePhotoSelect}
                    accept=".png, .jpg, .jpeg"
                  />
                </>
              )}
            </label>
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
