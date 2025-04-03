// RoleSelect.jsx
import React, { useState, useEffect } from "react";
import axios from "../../axios";
import PropTypes from "prop-types";
import "./RoleSelect.module.scss";

function RoleSelect({ userId }) {
  // Локальное состояние для текущей роли
  const [role, setRole] = useState("");

  // Список доступных ролей
  const roles = ["Заказчик", "Перевозчик", "Диспетчер", "Экспедитор"];

  // При первом рендере (и при изменении userId) — запросить актуальные данные о пользователе
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get(`/getUserById/${userId}`);
        // Предположим, что сервер возвращает объект пользователя со свойством role
        setRole(data.role || "");
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
      }
    }
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Обработчик изменения селекта
  const handleChange = async (event) => {
    const newRole = event.target.value;
    // Мгновенно обновляем локальное состояние, чтобы UI сразу отреагировал
    setRole(newRole);

    try {
      const { data } = await axios.post("/setRole", { userId, role: newRole });
      console.log("Роль обновлена на сервере:", data);
      // data.status, data.user, etc.
      // Если нужно, можно заново запросить /getUserById, чтобы убедиться в обновлении
      // но обычно достаточно мгновенного локального обновления
    } catch (error) {
      console.error("Ошибка при обновлении роли:", error);
      // Здесь можно добавить обработку ошибки
    }
  };

  return (
    <div
      className="role-select"
      style={{ position: "relative", display: "inline-block" }}
    >
      <select
        id="roleSelect"
        className="role-select__dropdown"
        value={role}
        onChange={handleChange}
        style={{ paddingRight: "2.5em" }}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <img
        src="/images/down.svg"
        alt="arrow down"
        className="role-select__arrow"
        style={{
          position: "absolute",
          pointerEvents: "none",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          width: "16px",
          height: "auto",
        }}
      />
    </div>
  );
}

// PropTypes для проверки типов пропсов (не обязательно, но полезно)
RoleSelect.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default RoleSelect;
