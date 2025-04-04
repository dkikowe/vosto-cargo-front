import React, { useContext } from "react";
import s from "./Create.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import { CityAutocomplete } from "./CityAutoComplete";

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
          }}
        >
          <div className={s.formGroup}>
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={onChange}
              placeholder="Описание заявки"
            />
          </div>

          {currentType === "CargoOrder" ? (
            <>
              <div className={s.formGroup}>
                <label>Место загрузки</label>
                <CityAutocomplete
                  onCitySelect={(selectedCity) => {
                    onChange({
                      target: { name: "from", value: selectedCity },
                    });
                  }}
                />
              </div>
              <div className={s.formGroup}>
                <label>Место выгрузки</label>
                <CityAutocomplete
                  onCitySelect={(selectedCity) => {
                    onChange({
                      target: { name: "to", value: selectedCity },
                    });
                  }}
                />
              </div>
              <div className={s.formGroup}>
                <label>Наименование груза</label>
                <input
                  name="cargo"
                  value={formData.cargo || ""}
                  onChange={onChange}
                  placeholder="Например, мебель"
                />
              </div>
              <div className={s.formGroup}>
                <label>Объём (м³)</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume || ""}
                  onChange={onChange}
                  placeholder="10"
                />
              </div>
              <div className={s.formGroup}>
                <label>Вес (кг)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight || ""}
                  onChange={onChange}
                  placeholder="1000"
                />
              </div>
            </>
          ) : (
            <>
              <div className={s.formGroup}>
                <label>Марка</label>
                <input
                  name="marka"
                  value={formData.marka || ""}
                  onChange={onChange}
                  placeholder="Например, Mercedes"
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип</label>
                <input
                  name="tip"
                  value={formData.tip || ""}
                  onChange={onChange}
                  placeholder="Например, Actros"
                />
              </div>
              <div className={s.formGroup}>
                <label>Кузов</label>
                <input
                  name="kuzov"
                  value={formData.kuzov || ""}
                  onChange={onChange}
                  placeholder="Например, тент"
                />
              </div>
              <div className={s.formGroup}>
                <label>Тип загрузки</label>
                <input
                  name="tip_zagruzki"
                  value={formData.tip_zagruzki || ""}
                  onChange={onChange}
                  placeholder="Например, задняя"
                />
              </div>
              <div className={s.formGroup}>
                <label>Грузоподъемность (т)</label>
                <input
                  type="number"
                  name="gruzopodyomnost"
                  value={formData.gruzopodyomnost || ""}
                  onChange={onChange}
                  placeholder="10"
                />
              </div>
              <div className={s.formGroup}>
                <label>Вместимость (м³)</label>
                <input
                  type="number"
                  name="vmestimost"
                  value={formData.vmestimost || ""}
                  onChange={onChange}
                  placeholder="40"
                />
              </div>
              <div className={s.formGroup}>
                <label>Дата готовности</label>
                <input
                  type="date"
                  name="data_gotovnosti"
                  value={formData.data_gotovnosti || ""}
                  onChange={onChange}
                />
              </div>
              <div className={s.formGroup}>
                <label>Откуда</label>
                <input
                  name="otkuda"
                  value={formData.otkuda || ""}
                  onChange={onChange}
                  placeholder="Например, Москва"
                />
              </div>
              <div className={s.formGroup}>
                <label>Куда</label>
                <input
                  name="kuda"
                  value={formData.kuda || ""}
                  onChange={onChange}
                  placeholder="Например, Казань"
                />
              </div>
              <div className={s.formGroup}>
                <label>Контактное лицо</label>
                <input
                  name="imya"
                  value={formData.imya || ""}
                  onChange={onChange}
                  placeholder="Имя"
                />
              </div>
              <div className={s.formGroup}>
                <label>Должность</label>
                <input
                  name="firma"
                  value={formData.firma || ""}
                  onChange={onChange}
                  placeholder="Название фирмы"
                />
              </div>
              <div className={s.formGroup}>
                <label>Телефон</label>
                <input
                  name="telefon"
                  value={formData.telefon || ""}
                  onChange={onChange}
                  placeholder="+7 912 345-67-89"
                />
              </div>
              <div className={s.formGroup}>
                <label>Город</label>
                <input
                  name="gorod"
                  value={formData.gorod || ""}
                  onChange={onChange}
                  placeholder="Город"
                />
              </div>
              <div className={s.formGroup}>
                <label>Почта</label>
                <input
                  name="pochta"
                  value={formData.pochta || ""}
                  onChange={onChange}
                  placeholder="example@mail.com"
                />
              </div>
              <div className={s.formGroup}>
                <label>Компания</label>
                <input
                  name="company"
                  value={formData.company || ""}
                  onChange={onChange}
                  placeholder="Название компании"
                />
              </div>
            </>
          )}

          <div className={s.formGroup}>
            <label>Способ оплаты</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod || ""}
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
