import React from "react";
import s from "./BottomSheetModal.module.sass";

export default function BottomSheetModal({ visible, onClose, children }) {
  if (!visible) return null;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.sheet} onClick={(e) => e.stopPropagation()}>
        <button className={s.closeBtn} onClick={onClose}>
          Закрыть
        </button>
        {children}
      </div>
    </div>
  );
}
