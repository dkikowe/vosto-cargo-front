import React, { useContext } from "react";
import s from "./Create.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import { CityAutocomplete } from "./CityAutoComplete";
import { useTranslation } from "react-i18next";

export function AddOrderModal({
  visible,
  onClose,
  currentType,
  formData,
  onChange,
  onSubmit,
}) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

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
          {currentType === "CargoOrder"
            ? t("order.addCargo")
            : t("order.addMachine")}
        </h3>
        <form
          onSubmit={onSubmit}
          className={s.createForm}
          style={{
            backgroundColor: theme === "dark" ? "#121212" : undefined,
          }}
        >
          <div className={s.formGroup}>
            <label>{t("order.description")}</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={onChange}
              placeholder={t("order.descriptionPlaceholder")}
            />
          </div>

          {currentType === "CargoOrder" ? (
            <>
              <div className={s.formGroup}>
                <label>{t("order.loadingPlace")}</label>
                <input
                  name="from"
                  value={formData.from || ""}
                  onChange={onChange}
                  placeholder={t("order.fromPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.unloadingPlace")}</label>
                <input
                  name="to"
                  value={formData.to || ""}
                  onChange={onChange}
                  placeholder={t("order.toPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.phone")}</label>
                <input
                  name="telefon"
                  value={formData.telefon || ""}
                  onChange={onChange}
                  placeholder="+7 912 345-67-89"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.cargoName")}</label>
                <input
                  name="cargo"
                  value={formData.cargo || ""}
                  onChange={onChange}
                  placeholder={t("order.cargoPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.volume")}</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume || ""}
                  onChange={onChange}
                  placeholder="10"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.weight")}</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight || ""}
                  onChange={onChange}
                  placeholder="1000"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.readyFrom")}</label>
                <input
                  type="date"
                  name="readyFrom"
                  value={formData.readyFrom || ""}
                  onChange={onChange}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.readyTo")}</label>
                <input
                  type="date"
                  name="readyTo"
                  value={formData.readyTo || ""}
                  onChange={onChange}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.rate")}</label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate || ""}
                  onChange={onChange}
                  placeholder="50000"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.vehicle")}</label>
                <input
                  name="vehicle"
                  value={formData.vehicle || ""}
                  onChange={onChange}
                  placeholder={t("order.vehiclePlaceholder")}
                />
              </div>
            </>
          ) : (
            <>
              <div className={s.formGroup}>
                <label>{t("order.brand")}</label>
                <input
                  name="marka"
                  value={formData.marka || ""}
                  onChange={onChange}
                  placeholder={t("order.brandPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.model")}</label>
                <input
                  name="tip"
                  value={formData.tip || ""}
                  onChange={onChange}
                  placeholder={t("order.modelPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.bodyType")}</label>
                <input
                  name="kuzov"
                  value={formData.kuzov || ""}
                  onChange={onChange}
                  placeholder={t("order.bodyTypePlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.loadingType")}</label>
                <input
                  name="tip_zagruzki"
                  value={formData.tip_zagruzki || ""}
                  onChange={onChange}
                  placeholder={t("order.loadingTypePlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.capacityTons")}</label>
                <input
                  type="number"
                  name="gruzopodyomnost"
                  value={formData.gruzopodyomnost || ""}
                  onChange={onChange}
                  placeholder="10"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.volumeCubic")}</label>
                <input
                  type="number"
                  name="vmestimost"
                  value={formData.vmestimost || ""}
                  onChange={onChange}
                  placeholder="40"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.readyDate")}</label>
                <input
                  type="date"
                  name="data_gotovnosti"
                  value={formData.data_gotovnosti || ""}
                  onChange={onChange}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.from")}</label>
                <input
                  name="otkuda"
                  value={formData.otkuda || ""}
                  onChange={onChange}
                  placeholder={t("order.fromPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.to")}</label>
                <input
                  name="kuda"
                  value={formData.kuda || ""}
                  onChange={onChange}
                  placeholder={t("order.toPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.contactName")}</label>
                <input
                  name="imya"
                  value={formData.imya || ""}
                  onChange={onChange}
                  placeholder={t("order.contactNamePlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.firm")}</label>
                <input
                  name="firma"
                  value={formData.firma || ""}
                  onChange={onChange}
                  placeholder={t("order.firmPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.phone")}</label>
                <input
                  name="telefon"
                  value={formData.telefon || ""}
                  onChange={onChange}
                  placeholder="+7 912 345-67-89"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.city")}</label>
                <input
                  name="gorod"
                  value={formData.gorod || ""}
                  onChange={onChange}
                  placeholder={t("order.cityPlaceholder")}
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.email")}</label>
                <input
                  name="pochta"
                  value={formData.pochta || ""}
                  onChange={onChange}
                  placeholder="example@mail.com"
                />
              </div>
              <div className={s.formGroup}>
                <label>{t("order.company")}</label>
                <input
                  name="company"
                  value={formData.company || ""}
                  onChange={onChange}
                  placeholder={t("order.companyPlaceholder")}
                />
              </div>
            </>
          )}

          <div className={s.formGroup}>
            <label>{t("order.paymentMethod")}</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod || ""}
              onChange={onChange}
            >
              <option value="">{t("order.paymentSelect")}</option>
              <option value="Кэш">{t("order.cash")}</option>
              <option value="Карта">{t("order.card")}</option>
            </select>
          </div>

          <button type="submit" className={s.submitBtn}>
            {t("order.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
