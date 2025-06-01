import React, { useRef, useState } from "react";
import s from "./SettingsPopup.module.sass";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const SettingsPopup = ({
  onClose,
  onLanguage,
  onPrivacy,
  theme,
  t,
  isDark,
  toggleTheme,
  currentLang,
}) => {
  // Для свайпа вниз
  const startY = useRef(null);
  const threshold = 60; // px
  const [closing, setClosing] = useState(false);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    if (startY.current !== null) {
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > threshold) {
        handleClose();
        startY.current = null;
      }
    }
  };
  const handleTouchEnd = () => {
    startY.current = null;
  };

  // Плавное закрытие
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300); // длительность анимации
  };

  return (
    <div
      className={`${s.overlay} ${theme === "dark" ? s.dark : s.light}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ pointerEvents: closing ? "none" : "auto" }}
    >
      <div className={s.bottomSheetPopup + (closing ? " closing" : "")}>
        <div className={s.handle}></div>

        <div className={s.title}>{t("cabinet.settings") || "Настройки"}</div>
        <div className={s.settingsList}>
          <div className={s.settingsItem} onClick={onPrivacy}>
            <img src="/images/design-icons-cab/conf.svg" alt="" />
            <span className={s.settingsItemLabel}>
              {t("cabinet.privacy") || "Конфиденциальность"}
            </span>
            <ChevronRight className={s.settingsItemArrow} />
          </div>
          <div className={s.settingsItem} onClick={onLanguage}>
            <img src="/images/design-icons-cab/lang.svg" alt="" />
            <span className={s.settingsItemLabel}>
              {t("cabinet.changeLang") || "Язык"}
            </span>
            <span className={s.settingsItemValue}>
              {currentLang || "русский"}
            </span>
            <ChevronRight className={s.settingsItemArrow} />
          </div>
          <div className={s.settingsItem} style={{ cursor: "default" }}>
            <img src="/images/design-icons-cab/theme.svg" alt="" />
            <span className={s.settingsItemLabel}>
              {t("cabinet.darkTheme") || "Ночной режим"}
            </span>
            <div className={s.settingsItemToggle}>
              <label className={s.switch}>
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={toggleTheme}
                  style={{ display: "none" }}
                />
                <span className={s.slider}></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
