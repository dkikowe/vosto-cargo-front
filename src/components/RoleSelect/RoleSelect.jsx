import React, { useState, useEffect } from "react";
import axios from "../../axios";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import "./RoleSelect.module.scss";

function RoleSelect({ userId }) {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const [role, setRole] = useState("");

  // Массив ролей с неизменяемыми значениями для бэка и ключами локализации для отображения
  const rolesList = [
    { value: "CUSTOMER", labelKey: "roleselect.customer" },
    { value: "LOGISTICIAN", labelKey: "roleselect.logistician" },
    { value: "DRIVER", labelKey: "roleselect.driver" },
  ];

  // При изменении userId загружаем роль пользователя с сервера
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get(`/getUserById/${userId}`);
        setRole(data.role || "");
      } catch (error) {
        console.error(t("roleselect.fetchError"), error);
      }
    }
    if (userId) {
      fetchUser();
    }
  }, [userId, t]);

  // Обновляем роль и отправляем новое значение на сервер
  const handleChange = async (event) => {
    const newRole = event.target.value;
    setRole(newRole);
    try {
      const { data } = await axios.post("/setRole", { userId, role: newRole });
      console.log(t("roleselect.updateSuccess"), data);
      updateUser({ role: newRole });
    } catch (error) {
      console.error(t("roleselect.updateError"), error);
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
      >
        <option value="" disabled>Выберите роль</option>
        {rolesList.map((r) => (
          <option key={r.value} value={r.value}>
            {t(r.labelKey) || (r.value === 'CUSTOMER' ? 'Заказчик' : r.value === 'LOGISTICIAN' ? 'Логист' : 'Водитель')}
          </option>
        ))}
      </select>
      <img
        src="/images/down.svg"
        alt={t("roleselect.arrowDown")}
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

RoleSelect.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default RoleSelect;
