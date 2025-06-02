import React, { useState } from "react";
import s from "../Create.module.sass";

const steps = ["Информация о заявке", "Информация о грузе", "Детали заявки"];

export default function AddCargoStepper({ onSubmit, onClose }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className={s.createForm} onSubmit={handleSubmit}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 20 }}>Добавление груза</div>
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
            className={s.input}
            style={{ background: "#3a5c9f", color: "#fff" }}
          >
            Далее
          </button>
        ) : (
          <button
            type="submit"
            className={s.input}
            style={{ background: "#3a5c9f", color: "#fff" }}
          >
            Создать заявку
          </button>
        )}
      </div>
    </form>
  );
}
