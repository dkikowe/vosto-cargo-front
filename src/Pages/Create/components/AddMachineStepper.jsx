import React, { useState, useEffect } from "react";
import s from "../Create.module.sass";

const steps = [
  "Информация о машине",
  "Информация о владельце",
  "Детали заявки",
];

export default function AddMachineStepper({
  onSubmit,
  onClose,
  initialValues,
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    marka: "",
    model: "",
    bodyType: "",
    loadingType: "",
    capacity: "",
    volume: "",
    fio: "",
    company: "",
    position: "",
    city: "",
    phone: "",
    email: "",
    loadingCity: "",
    unloadingCity: "",
    readyDate: "",
    payment: "",
  });
  const [allowSubmit, setAllowSubmit] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setForm({
        marka: initialValues.marka || "",
        model: initialValues.model || initialValues.tip || "",
        bodyType: initialValues.bodyType || initialValues.kuzov || "",
        loadingType:
          initialValues.loadingType || initialValues.tip_zagruzki || "",
        capacity: initialValues.capacity || initialValues.gruzopodyomnost || "",
        volume: initialValues.volume || initialValues.vmestimost || "",
        fio: initialValues.fio || initialValues.imya || "",
        company: initialValues.company || initialValues.firma || "",
        position: initialValues.position || "",
        city: initialValues.city || initialValues.gorod || "",
        phone: initialValues.phone || initialValues.telefon || "",
        email: initialValues.email || initialValues.pochta || "",
        loadingCity: initialValues.loadingCity || initialValues.otkuda || "",
        unloadingCity: initialValues.unloadingCity || initialValues.kuda || "",
        readyDate:
          initialValues.readyDate || initialValues.data_gotovnosti || "",
        payment: initialValues.payment || initialValues.paymentMethod || "",
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allowSubmit) {
      console.log("Попытка submit без allowSubmit");
      return;
    }
    console.log("Submit формы AddMachineStepper", form);
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
      className={s.createForm}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      style={{ maxHeight: 400, overflowY: "auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 20 }}>
          {initialValues
            ? "Редактирование автомобиля"
            : "Добавление автомобиля"}
        </div>
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
            name="marka"
            value={form.marka}
            onChange={handleChange}
            placeholder="Марка"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Модель"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
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
          <select
            name="loadingType"
            value={form.loadingType}
            onChange={handleChange}
            className={s.input}
            style={{ marginBottom: 8 }}
          >
            <option value="">Тип погрузки</option>
            <option value="Задняя">Задняя</option>
            <option value="Боковая">Боковая</option>
            <option value="Верхняя">Верхняя</option>
          </select>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Грузоподъемность (т)"
              className={s.input}
              style={{ flex: 1 }}
            />
            <input
              name="volume"
              value={form.volume}
              onChange={handleChange}
              placeholder="Вместимость (м³)"
              className={s.input}
              style={{ flex: 1 }}
            />
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <input
            name="fio"
            value={form.fio}
            onChange={handleChange}
            placeholder="ФИО"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Название компании"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Должность"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Город"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+7 (___) ___-__-__"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
        </>
      )}
      {step === 2 && (
        <>
          <input
            name="loadingCity"
            value={form.loadingCity}
            onChange={handleChange}
            placeholder="Город погрузки"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="unloadingCity"
            value={form.unloadingCity}
            onChange={handleChange}
            placeholder="Город выгрузки"
            className={s.input}
            style={{ marginBottom: 8 }}
          />
          <input
            name="readyDate"
            type="date"
            value={form.readyDate}
            onChange={handleChange}
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
            onClick={() => setAllowSubmit(true)}
          >
            {initialValues ? "Сохранить изменения" : "Создать заявку"}
          </button>
        )}
      </div>
    </form>
  );
}
