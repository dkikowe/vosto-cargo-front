import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import s from "./Start.module.sass";

export default function Start() {
  const [selected, setSelected] = useState("Грузодатель");
  const [isLoading, setIsLoading] = useState(true);
  const roles = [
    { name: "Грузодатель", emoji: "📦" },
    { name: "Грузоперевозчик", emoji: "🚚" },
    { name: "Диспетчер", emoji: "📞" },
  ];
  const validRoles = roles.map((role) => role.name);
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");
  const initData = window.Telegram.WebApp.initData;

  // Новый useEffect для создания пользователя, если его ещё нет
  useEffect(() => {
    if (!userId && initData) {
      try {
        const params = new URLSearchParams(initData);
        const userData = params.get("user");

        if (userData) {
          const userObj = JSON.parse(decodeURIComponent(userData));
          console.log("Init user:", userObj);

          if (!userObj.id) {
            alert("Не удалось получить Telegram ID");
            return;
          }

          axios
            .post("/getTelegramId", {
              initData: userObj.id,
              img: userObj.photo_url,
              name: userObj.username || userObj.first_name,
            })
            .then((response) => {
              if (response.data?.user?._id) {
                localStorage.setItem("id", response.data.user._id);
              }
              // После создания пользователя проверяем роль
              checkRole(response.data?.user?._id || userId);
            })
            .catch((error) => {
              console.error("Ошибка при отправке данных:", error);
              alert("Произошла ошибка при создании пользователя");
              setIsLoading(false);
            });
        }
      } catch (error) {
        console.error("Ошибка при разборе initData:", error);
        setIsLoading(false);
      }
    } else {
      // Если пользователь уже существует, сразу проверяем роль
      checkRole(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData, userId]);

  // Функция для проверки роли пользователя
  const checkRole = (id) => {
    if (id) {
      axios
        .get(`/getUserById/${id}`)
        .then((res) => {
          if (res.data && validRoles.includes(res.data.role)) {
            navigate("/menu");
          } else {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении пользователя:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      await axios.post("/setRole", {
        userId: localStorage.getItem("id"),
        role: selected,
      });
      navigate("/menu");
    } catch (error) {
      console.error("Ошибка при установке роли:", error);
      alert("Не удалось сохранить роль, попробуйте ещё раз");
    }
  };

  if (isLoading) {
    return <div className={s.loading}>Загрузка...</div>;
  }

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
