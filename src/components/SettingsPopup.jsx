import React, { useRef, useState } from "react";
import s from "./SettingsPopup.module.sass";
import { ChevronRight } from "lucide-react";

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
  const startY = useRef(null);
  const sheetRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const threshold = 100;

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > threshold) {
      sheetRef.current.classList.add(s.closing);
    } else {
      sheetRef.current.style.transition = "transform 0.3s";
      sheetRef.current.style.transform = "translateY(0)";
      setTimeout(() => {
        sheetRef.current.style.transition = "";
      }, 300);
    }
    setTranslateY(0);
  };

  const handleAnimationEnd = () => {
    if (sheetRef.current.classList.contains(s.closing)) {
      onClose();
    }
  };

  return (
    <div
      className={`${s.overlay} ${theme === "dark" ? s.dark : ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={sheetRef}
        className={s.bottomSheetPopup}
        onAnimationEnd={handleAnimationEnd}
      >
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
