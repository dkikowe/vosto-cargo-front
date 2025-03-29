import React from "react";
import s from "./StatusSwitcher.module.sass";

export const StatusSwitcher = ({ currentTab, onTabChange }) => {
  return (
    <div className={s.statusButtons}>
      <button
        className={currentTab === "active" ? s.statusActive : s.statusItem}
        onClick={() => onTabChange("active")}
      >
        Опубликовано
      </button>
      <button
        className={currentTab === "archive" ? s.statusActiveArchive : s.archive}
        onClick={() => onTabChange("archive")}
      >
        Архив
      </button>
    </div>
  );
};
