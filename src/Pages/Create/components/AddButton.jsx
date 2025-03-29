import React from "react";
import s from "./AddButton.module.sass";

export const AddButton = ({
  showMenu,
  onPlusClick,
  onAddCargo,
  onAddMachine,
}) => {
  return (
    <div className={s.plusWrapper}>
      <p className={s.plus} onClick={onPlusClick}>
        +
      </p>
      {showMenu && (
        <div className={s.plusMenu}>
          <button className={s.plusButton} onClick={onAddCargo}>
            Добавить груз
          </button>
          <button className={s.plusButton} onClick={onAddMachine}>
            Добавить машину
          </button>
        </div>
      )}
    </div>
  );
};
