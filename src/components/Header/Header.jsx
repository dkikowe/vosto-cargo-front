import s from "./Header.module.sass";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function Header() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className={`${s.header} ${isDark ? s.dark : ""}`}>
      <div className={s.logo}>
        <img src="/images/header-icons/logo.svg" alt="logo" />
        <div className={s.line}></div>
      </div>
    </div>
  );
}
