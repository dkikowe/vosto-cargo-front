import React, { useState } from "react";
import s from "./CalculatorPopup.module.sass";
import axios from "../../axios";

export default function CalculatorPopup({ onClose, theme, t }) {
  const [cityA, setCityA] = useState("");
  const [cityB, setCityB] = useState("");
  const [carType, setCarType] = useState("тент");
  const [cargoType, setCargoType] = useState("full");
  const [volume, setVolume] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setError(null);
    setResult(null);
    if (!cityA || !cityB || !carType) return;
    if (cargoType === "groupage" && (!volume || !weight)) {
      setError(t("calculator.error"));
      return;
    }
    try {
      setLoading(true);
      const params = { cityA, cityB, carType, cargoType };
      if (cargoType === "groupage") {
        params.volume = volume;
        params.weight = weight;
      }
      const res = await axios.get("/getShippingCalculation", { params });
      setResult(res.data);
    } catch (err) {
      setError(t("calculator.serverError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${s.overlay} ${theme === "dark" ? s.dark : s.light}`}>
      <div className={s.bottomSheetPopup}>
        <button className={s.closeBtn} onClick={onClose}>
          ×
        </button>
        <h2 className={s.title}>{t("calculator.title")}</h2>
        <div className={s.field}>
          <label>{t("calculator.cityFrom")}</label>
          <input
            type="text"
            value={cityA}
            onChange={(e) => setCityA(e.target.value)}
            placeholder={t("calculator.placeholderFrom")}
          />
        </div>
        <div className={s.field}>
          <label>{t("calculator.cityTo")}</label>
          <input
            type="text"
            value={cityB}
            onChange={(e) => setCityB(e.target.value)}
            placeholder={t("calculator.placeholderTo")}
          />
        </div>
        <div className={s.selects}>
          <div className={s.field}>
            <label>{t("calculator.carType")}</label>
            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              className={s.select}
            >
              <option value="тент">{t("calculator.tent")}</option>
              <option value="рефрижератор">
                {t("calculator.refrigerator")}
              </option>
            </select>
          </div>
          <div className={s.field}>
            <label>{t("calculator.cargoType")}</label>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className={s.select}
            >
              <option value="full">{t("calculator.fullTruck")}</option>
              <option value="groupage">{t("calculator.groupage")}</option>
            </select>
          </div>
        </div>
        {cargoType === "groupage" && (
          <>
            <div className={s.field}>
              <label>{t("calculator.volume")}</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder={t("calculator.placeholderVolume")}
              />
            </div>
            <div className={s.field}>
              <label>{t("calculator.weight")}</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={t("calculator.placeholderWeight")}
              />
            </div>
          </>
        )}
        {loading ? (
          <button className={s.calculateBtn} disabled>
            {t("calculator.loading")}
          </button>
        ) : (
          <button className={s.calculateBtn} onClick={handleCalculate}>
            {t("calculator.calculate")}
          </button>
        )}
        {error && <p className={s.error}>{error}</p>}
        {result && !loading && (
          <div className={s.result}>
            <p>
              {t("calculator.distance")}: {result.distance} км
            </p>
            <p>
              {t("calculator.tariff")}: {result.tariff} ₽/км
            </p>
            <p className={s.total}>
              {t("calculator.total")}: {parseFloat(result.price).toFixed(2)} ₽
            </p>
          </div>
        )}
        <p className={s.warn}>{t("calculator.disclaimer")}</p>
      </div>
    </div>
  );
}
