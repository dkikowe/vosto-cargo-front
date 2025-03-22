import { useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./Start.module.sass";

export default function Start() {
  const roles = [
    { name: "Грузодатель", emoji: "📦" },
    { name: "Грузоперевозчик", emoji: "🚚" },
    { name: "Диспетчер", emoji: "📞" },
  ];

  const [selected, setSelected] = useState("Грузодатель");
  const navigate = useNavigate();

  const handleNext = () => {
    // Сохраняем выбранную роль в localStorage (если нужно)
    localStorage.setItem("role", selected);
    // Передаём роль через state и переходим в меню
    navigate("/menu", { state: { role: selected } });
  };

  return (
    <div className={s.container}>
      <p className={s.who}>Кто вы?</p>
      <div className={s.buttons}>
        {roles.map((role) => (
          <button
            key={role.name}
            className={`${s.button} ${selected === role.name ? s.active : ""}`}
            onClick={() => setSelected(role.name)}
          >
            <span className={s.emoji}>{role.emoji}</span> {role.name}
          </button>
        ))}
      </div>
      <button className={s.goButton} onClick={handleNext}>
        Далее
      </button>
    </div>
  );
}
