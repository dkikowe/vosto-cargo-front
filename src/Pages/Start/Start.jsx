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
  const id = localStorage.getItem("id");
  const initData = window.Telegram.WebApp.initData;

  useEffect(() => {
    try {
      if (initData) {
        const params = new URLSearchParams(initData);
        const userData = params.get("user");

        if (userData) {
          const userObj = JSON.parse(decodeURIComponent(userData));
          console.log(userObj);

          if (!userObj.id) {
            alert("Не удалось получить Telegram ID");
            return;
          }

          axios
            .post("/getTelegramId", {
              initData: userObj.id,
              img: userObj.photo_url,
              name: userObj.username,
            })
            .then((response) => {
              console.log(response);
              if (response.data?.user?._id) {
                localStorage.setItem("id", response.data.user._id);
              }
            })
            .catch((error) => {
              console.error("Ошибка при отправке данных:", error);
              alert("Произошла ошибка");
            });
        }
      }
    } catch (error) {
      console.error("Ошибка при разборе initData:", error);
    }
  }, [initData]);

  // Проверяем наличие роли у пользователя при загрузке компонента
  useEffect(() => {
    if (id) {
      axios
        .get(`/getUserById/${id}`)
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
  }, [id, navigate, validRoles]);

  const handleNext = async () => {
    try {
      console.log("userId:", id);
      console.log("role:", selected);

      await axios.post("/setRole", { id, role: selected });
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
