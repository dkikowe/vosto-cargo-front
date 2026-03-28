import React, { useState, useEffect, useContext } from "react";
import s from "../Create.module.sass";
import { ThemeContext } from "../../../context/ThemeContext";
import axios from "../../../axios";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const steps = ["Информация о заявке", "Информация о грузе", "Детали заявки"];

export default function AddCargoStepper({ onSubmit, onClose, initialValues }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    from: "",
    to: "",
    dateFrom: "",
    dateTo: "",
    bodyType: "",
    cargoName: "",
    volume: "",
    weight: "",
    phone: "",
    rate: "",
    payment: "",
  });
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [magicText, setMagicText] = useState("");
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (initialValues) {
      setForm({
        from: initialValues.from || "",
        to: initialValues.to || "",
        dateFrom: initialValues.dateFrom || "",
        dateTo: initialValues.dateTo || "",
        bodyType: initialValues.bodyType || initialValues.vehicle || "",
        cargoName: initialValues.cargoName || initialValues.cargo || "",
        volume: initialValues.volume || "",
        weight: initialValues.weight || "",
        phone: initialValues.phone || initialValues.telefon || "",
        rate: initialValues.rate || "",
        payment: initialValues.payment || initialValues.paymentMethod || "",
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMagicParse = async () => {
    if (!magicText.trim()) return;
    setIsMagicLoading(true);
    try {
      const { data } = await axios.post("/ai/parse-order", { text: magicText });
      
      setForm((prev) => ({
        ...prev,
        cargoName: data.cargoType || prev.cargoName,
        weight: data.weight ? data.weight.toString() : prev.weight,
        volume: data.volume ? data.volume.toString() : prev.volume,
        from: data.from || prev.from,
        to: data.to || prev.to,
      }));
      
      toast.success("Данные успешно заполнены!");
    } catch (error) {
      console.error("AI Parse Error:", error);
      toast.error("Не удалось распознать, заполните вручную");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allowSubmit) {
      console.log("Попытка submit без allowSubmit");
      return;
    }
    console.log("Submit формы AddCargoStepper", form);
    onSubmit(form);
    setAllowSubmit(false);
  };

  const handleKeyDown = (e) => {
    if (step === 2 && e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <form
      className={`${s.createForm} ${theme === "dark" ? s.dark : ""}`}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      style={{ maxHeight: 400, overflowY: "auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 20,
            color: theme === "dark" ? "#fff" : undefined,
          }}
        >
          {initialValues ? "Редактирование груза" : "Добавление груза"}
        </div>
        
        {!initialValues && step === 0 && (
          <div style={{ margin: "16px 0", padding: "12px", background: theme === "dark" ? "#2a2a2a" : "#f0f9ff", borderRadius: "8px", border: "1px dashed #3a5c9f" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <textarea
                value={magicText}
                onChange={(e) => setMagicText(e.target.value)}
                placeholder="Напишите, что нужно перевезти (например: 3 паллеты кирпичей из Москвы в Тулу, хрупкое)"
                className={s.input}
                style={{ width: "100%", minHeight: "60px", resize: "vertical", fontSize: "13px" }}
              />
            </div>
            <button
              type="button"
              onClick={handleMagicParse}
              disabled={isMagicLoading || !magicText.trim()}
              style={{
                background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                opacity: isMagicLoading ? 0.7 : 1
              }}
            >
              <Sparkles size={16} />
              {isMagicLoading ? "Анализируем..." : "Заполнить автоматически"}
            </button>
          </div>
        )}

        <div
          style={{
            color: theme === "dark" ? "#ccc" : "#888",
            fontSize: 15,
            margin: "8px 0",
          }}
        >
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
                background:
                  i <= step ? "#3a5c9f" : theme === "dark" ? "#444" : "#e0e0e0",
              }}
            />
          ))}
        </div>
      </div>
      {step === 0 && (
        <>
          <input
            name="from"
            value={form.from}
            onChange={handleChange}
            placeholder="Город погрузки"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="to"
            value={form.to}
            onChange={handleChange}
            placeholder="Город выгрузки"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              name="dateFrom"
              type="date"
              value={form.dateFrom}
              onChange={handleChange}
              className={s.input}
              style={{ flex: 1 }}
            />
            <input
              name="dateTo"
              type="date"
              value={form.dateTo}
              onChange={handleChange}
              className={s.input}
              style={{ flex: 1 }}
            />
          </div>
          <select
            name="bodyType"
            value={form.bodyType}
            onChange={handleChange}
            className={s.input}
            style={{ marginBottom: 8 }}
          >
            <option value="">Тип кузова</option>
            <option value="Тент">Тент</option>
            <option value="Рефрижератор">Рефрижератор</option>
            <option value="Борт">Борт</option>
          </select>
        </>
      )}
      {step === 1 && (
        <>
          <input
            name="cargoName"
            value={form.cargoName}
            onChange={handleChange}
            placeholder="Наименование груза"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              name="volume"
              value={form.volume}
              onChange={handleChange}
              placeholder="Объем (м³)"
              className={s.input}
              style={{ flex: 1 }}
            />
            <input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Вес (кг)"
              className={s.input}
              style={{ flex: 1 }}
            />
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+7 (___) ___-__-__"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="rate"
            value={form.rate}
            onChange={handleChange}
            placeholder="Ставка (₽)"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <select
            name="payment"
            value={form.payment}
            onChange={handleChange}
            className={s.input}
            style={{ marginBottom: 8 }}
          >
            <option value="">Выберите способ оплаты</option>
            <option value="Карта">Карта</option>
            <option value="Кэш">Кэш</option>
          </select>
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {step > 0 && (
          <button
            type="button"
            onClick={prev}
            className={s.input}
            style={{
              background: theme === "dark" ? "#232323" : "#f5f5f5",
              color: theme === "dark" ? "#4f46e5" : "#3a5c9f",
              border: `1px solid ${theme === "dark" ? "#4f46e5" : "#3a5c9f"}`,
            }}
          >
            ←
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            className={s.input}
            style={{
              background: theme === "dark" ? "#4f46e5" : "#3a5c9f",
              color: "#fff",
            }}
          >
            Далее
          </button>
        ) : (
          <button
            type="submit"
            className={s.input}
            style={{
              background: theme === "dark" ? "#4f46e5" : "#3a5c9f",
              color: "#fff",
            }}
            onClick={() => setAllowSubmit(true)}
          >
            {initialValues ? "Сохранить изменения" : "Создать заявку"}
          </button>
        )}
      </div>
    </form>
  );
}
