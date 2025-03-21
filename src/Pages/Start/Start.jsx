import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import s from "./Start.module.sass";

export default function Start() {
  const [selected, setSelected] = useState("Грузодатель");
  const [isLoading, setIsLoading] = useState(true); // состояние загрузки

  const roles = [
    { name: "Грузодатель", emoji: "📦" },
    { name: "Грузоперевозчик", emoji: "🚚" },
    { name: "Диспетчер", emoji: "📞" },
  ];

  const validRoles = roles.map((role) => role.name);
  // ["Грузодатель", "Грузоперевозчик", "Диспетчер"]

  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  // Проверяем наличие роли у пользователя при загрузке компонента
  useEffect(() => {
    if (userId) {
      axios
        .get(`/getUserById/${userId}`)
        .then((res) => {
          if (res.data && validRoles.includes(res.data.role)) {
            // Если роль уже одна из допустимых, сразу переходим в меню
            navigate("/menu");
          } else {
            // Если роль отсутствует, пустая или неверная — разрешаем выбрать
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении пользователя:", error);
          // Даже если произошла ошибка, даём возможность выбрать роль
          setIsLoading(false);
        });
    } else {
      // Если userId нет, тоже показываем выбор роли
      setIsLoading(false);
    }
  }, [userId, navigate, validRoles]);

  const handleNext = async () => {
    try {
      await axios.post("/setRole", { userId, role: selected });
      navigate("/menu");
    } catch (error) {
      console.error("Ошибка при установке роли:", error);
      alert("Не удалось сохранить роль, попробуйте ещё раз");
    }
  };

  if (isLoading) {
    // Пока идёт проверка роли, показываем «Загрузка…»
    return <div className={s.loading}>Загрузка...</div>;
  }

  // Если проверка закончилась и роль не валидная, показываем выбор
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
