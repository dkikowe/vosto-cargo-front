import React, { useContext } from "react";
import s from "./BottomSheetModal.module.sass";
import { ThemeContext } from "../../../context/ThemeContext";

export default function BottomSheetModal({ visible, onClose, children }) {
  const { theme } = useContext(ThemeContext);

  if (!visible) return null;

  return (
    <div className={s.overlay}>
      <div className={`${s.sheet} ${theme === "dark" ? s.dark : ""}`}>
        <button className={s.closeBtn} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
