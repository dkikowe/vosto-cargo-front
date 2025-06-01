import s from "./Conf.module.sass";
import React, { useContext } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Conf() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const containerStyle = {
    backgroundColor: isDark ? "#121212" : "#fff",
  };

  return (
    <div className={s.container} style={containerStyle}>
      <div className={s.header}>
        <ChevronLeft
          onClick={() => navigate("/menu")}
          style={{ cursor: "pointer", color: isDark ? "#fff" : "#fff" }}
        />
        <h2 className={s.title}>{t("conf.title")}</h2>
      </div>

      <p
        style={{
          whiteSpace: "pre-line",
          lineHeight: "1.6",
          color: isDark ? "#fff" : "#000",
          padding: "0px 20px",
        }}
      >
        {t("conf.text")}
      </p>
    </div>
  );
}
