import React from "react";
import s from "./TypeSwitcher.module.sass";

export const TypeSwitcher = ({ currentType, onTypeChange }) => {
  const typeIndicatorLeft = currentType === "CargoOrder" ? "0%" : "50%";

  return (
    <div className={s.typeSwitcher}>
      <div className={s.switchIndicator} style={{ left: typeIndicatorLeft }} />
      <button
        className={currentType === "CargoOrder" ? s.activeText : s.switcher}
        onClick={() => onTypeChange("CargoOrder")}
      >
        Грузы
      </button>
      <button
        className={currentType === "MachineOrder" ? s.activeText : s.switcher}
        onClick={() => onTypeChange("MachineOrder")}
      >
        Машины
      </button>
    </div>
  );
};
