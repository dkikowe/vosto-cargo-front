import React, { useContext } from "react";
import s from "./Create.module.sass";
import { ThemeContext } from "../../context/ThemeContext";

export function AddOrderModal({
  visible,
  onClose,
  currentType,
  formData,
  onChange,
  onSubmit,
}) {
  const { theme } = useContext(ThemeContext);
  if (!visible) return null;

  return (
    <div
      className={`${s.modalOverlay} ${
        theme === "dark" ? s.darkModal : s.lightModal
      }`}
    >
      <div
        className={s.modalContent}
        style={{
          backgroundColor: theme === "dark" ? "#121212" : undefined,
          border: theme === "dark" ? "1px solid #fff" : undefined,
        }}
      >
        <button className={s.closeBtn} onClick={onClose}>
          ×
        </button>
        <h3>
          {currentType === "CargoOrder" ? "Добавить груз" : "Добавить машину"}
        </h3>
        <form
          onSubmit={onSubmit}
          className={s.createForm}
          style={{
            backgroundColor: theme === "dark" ? "#121212" : undefined,
            border: theme === "dark" ? "1px solid #fff" : undefined,
          }}
        >
          <div className={s.formGroup}>
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Описание заявки"
            />
          </div>

          {currentType === "CargoOrder" ? (
            <>
              <div className={s.formGroup}>
                <label>Место загрузки</label>
                <input
                  name="loadingPlace"
                  value={formData.loadingPlace}
                  onChange={onChange}
                  placeholder="Например, Москва"
                />
              </div>
              <div className={s.formGroup}>
                <label>Место выгрузки</label>
                <input
                  name="unloadingPlace"
                  value={formData.unloadingPlace}
                  onChange={onChange}
                  placeholder="Например, Санкт-Петербург"
                />
              </div>
              <div className={s.formGroup}>
                <label>Наименование груза</label>
                <input
                  name="cargoName"
                  value={formData.cargoName}
                  onChange={onChange}
                  placeholder="Например, мебель"
                />
              </div>
              <div className={s.formGroup}>
                <label>Объём (м³)</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={onChange}
                  placeholder="10"
                />
              </div>
              <div className={s.formGroup}>
                <label>Вес (кг)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={onChange}
                  placeholder="1000"
                />
              </div>
              <div className={s.formGroup}>
                <label>Температура</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={onChange}
                  placeholder="0"
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип кузова</label>
                <input
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={onChange}
                  placeholder="Рефрижератор, тент..."
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип загрузки</label>
                <input
                  name="loadingType"
                  value={formData.loadingType}
                  onChange={onChange}
                  placeholder="Верхняя, боковая..."
                />
              </div>
              <div className={s.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="TIR"
                    checked={formData.TIR}
                    onChange={onChange}
                  />
                  TIR
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="CRM"
                    checked={formData.CRM}
                    onChange={onChange}
                  />
                  CRM
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="medKnizhka"
                    checked={formData.medKnizhka}
                    onChange={onChange}
                  />
                  Медкнижка
                </label>
              </div>
            </>
          ) : (
            <>
              <div className={s.formGroup}>
                <label>Гос. номер</label>
                <input
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={onChange}
                  placeholder="А123ВС"
                />
              </div>
              <div className={s.formGroup}>
                <label>Марка и модель</label>
                <input
                  name="brandAndModel"
                  value={formData.brandAndModel}
                  onChange={onChange}
                  placeholder="Mercedes Actros"
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип машины</label>
                <select
                  name="machineType"
                  value={formData.machineType}
                  onChange={onChange}
                >
                  <option value="Грузовик">Грузовик</option>
                  <option value="Полуприцеп">Полуприцеп</option>
                  <option value="Сцепка">Сцепка</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label>Грузоподъёмность (т)</label>
                <input
                  type="number"
                  name="payloadCapacity"
                  value={formData.payloadCapacity}
                  onChange={onChange}
                  placeholder="10"
                />
              </div>
              <div className={s.formGroup}>
                <label>Объём кузова (м³)</label>
                <input
                  type="number"
                  name="bodyVolume"
                  value={formData.bodyVolume}
                  onChange={onChange}
                  placeholder="40"
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип(ы) загрузки (через запятую)</label>
                <input
                  name="loadingTypes"
                  value={formData.loadingTypes}
                  onChange={onChange}
                  placeholder="Боковая, Задняя..."
                />
              </div>
              <div className={s.formGroup}>
                <label>Маршрут</label>
                <input
                  name="route"
                  value={formData.route}
                  onChange={onChange}
                  placeholder="Москва - Казань"
                />
              </div>
              <div className={s.formGroup}>
                <label>Дата загрузки</label>
                <input
                  type="date"
                  name="loadingDate"
                  value={formData.loadingDate}
                  onChange={onChange}
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип даты</label>
                <select
                  name="dateOption"
                  value={formData.dateOption}
                  onChange={onChange}
                >
                  <option value="Постоянно">Постоянно</option>
                  {/* Если в схеме вместо "Регулярно" используется "Машина готова" */}
                  <option value="Машина готова">Машина готова</option>
                  <option value="Период">Период</option>
                </select>
              </div>
              {formData.dateOption === "Период" && (
                <div className={s.periodGroup}>
                  <label>С</label>
                  <input
                    type="date"
                    name="loadingPeriodFrom"
                    value={formData.loadingPeriodFrom}
                    onChange={onChange}
                  />
                  <label>По</label>
                  <input
                    type="date"
                    name="loadingPeriodTo"
                    value={formData.loadingPeriodTo}
                    onChange={onChange}
                  />
                </div>
              )}
              <div className={s.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="TIR"
                    checked={formData.TIR}
                    onChange={onChange}
                  />
                  TIR
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="EKMT"
                    checked={formData.EKMT}
                    onChange={onChange}
                  />
                  EKMT
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gpsMonitoring"
                    checked={formData.gpsMonitoring}
                    onChange={onChange}
                  />
                  GPS
                </label>
              </div>
              <div className={s.formGroup}>
                <label>ADR-классы (через запятую)</label>
                <input
                  name="ADR"
                  value={formData.ADR}
                  onChange={onChange}
                  placeholder="ADR1, ADR2..."
                />
              </div>
            </>
          )}

          {/* Поле «Способ оплаты» (универсально для любого типа заказа) */}
          <div className={s.formGroup}>
            <label>Способ оплаты</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={onChange}
            >
              <option value="">Выберите способ оплаты</option>
              <option value="Кэш">Наличные</option>
              <option value="Карта">Карта</option>
            </select>
          </div>

          <button type="submit" className={s.submitBtn}>
            Создать
          </button>
        </form>
      </div>
    </div>
  );
}
