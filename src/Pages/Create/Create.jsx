import React, { useState, useEffect } from "react";
import s from "./Create.module.sass";
import axios from "../../axios.js";

export default function Create() {
  const userId = localStorage.getItem("id");
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Состояние формы
  const [formData, setFormData] = useState({
    weight: "",
    volume: "",
    description: "",
    originCity: "",
    destinationCity: "",
    vehicle: "",
    maxLoad: "",
    dispatcherComments: "",
  });

  // Список заказов пользователя
  const [orders, setOrders] = useState([]);

  // 1. Загружаем данные о пользователе (получаем роль)
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data } = await axios.get(`/getUserById/${userId}`);
        console.log("User data:", data);
        setUserRole(data.role);
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (userId) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  // 2. Функция загрузки заказов для этого пользователя
  const fetchUserOrders = async () => {
    try {
      const { data } = await axios.get(`/orders?userId=${userId}`);
      setOrders(data);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    }
  };

  // 3. Загружаем заказы, когда роль известна (или сразу после загрузки пользователя)
  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  // Изменение формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Создание заявки
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, userId, role: userRole };
      const { data: savedOrder } = await axios.post("/orders", payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Заявка успешно создана:", savedOrder);
      // Очищаем форму
      setFormData({
        weight: "",
        volume: "",
        description: "",
        originCity: "",
        destinationCity: "",
        vehicle: "",
        maxLoad: "",
        dispatcherComments: "",
      });

      // Повторно загружаем заказы
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка создания заявки:", error);
    }
  };

  if (isLoading) return <p>Загрузка...</p>;
  if (!userRole) return <p>Ошибка: роль пользователя не найдена</p>;
  console.log(orders);

  return (
    <div className={s.createContainer}>
      <h2>Создать заявку ({userRole})</h2>
      <form onSubmit={handleSubmit} className={s.form}>
        {/* Разные поля в зависимости от роли */}
        {userRole === "Грузодатель" && (
          <>
            <div className={s.formGroup}>
              <label>Вес:</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Введите вес груза"
              />
            </div>
            <div className={s.formGroup}>
              <label>Объем:</label>
              <input
                type="text"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                placeholder="Введите объем груза"
              />
            </div>
          </>
        )}

        {userRole === "Грузоперевозчик" && (
          <>
            <div className={s.formGroup}>
              <label>Транспортное средство:</label>
              <input
                type="text"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                placeholder="Марка и модель"
              />
            </div>
            <div className={s.formGroup}>
              <label>Максимальная нагрузка:</label>
              <input
                type="text"
                name="maxLoad"
                value={formData.maxLoad}
                onChange={handleChange}
                placeholder="Введите максимальную нагрузку"
              />
            </div>
          </>
        )}

        {userRole === "Диспетчер" && (
          <div className={s.formGroup}>
            <label>Комментарии диспетчера:</label>
            <textarea
              name="dispatcherComments"
              value={formData.dispatcherComments}
              onChange={handleChange}
              placeholder="Введите комментарий"
            ></textarea>
          </div>
        )}

        {/* Общие поля */}
        <div className={s.formGroup}>
          <label>Описание:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Опишите заказ"
          />
        </div>
        <div className={s.formGroup}>
          <label>Город отправления:</label>
          <input
            type="text"
            name="originCity"
            value={formData.originCity}
            onChange={handleChange}
            placeholder="Введите город отправления"
          />
        </div>
        <div className={s.formGroup}>
          <label>Город назначения:</label>
          <input
            type="text"
            name="destinationCity"
            value={formData.destinationCity}
            onChange={handleChange}
            placeholder="Введите город назначения"
          />
        </div>

        <button type="submit" className={s.submitBtn}>
          Отправить заявку
        </button>
      </form>

      {/* Список заказов пользователя */}
      <h3>Ваши заказы</h3>
      <div>
        {orders.length === 0 ? (
          <p>У вас пока нет заказов</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className={s.orderItem}>
              <p>
                <strong>Тип заказа:</strong> {order.orderType}
              </p>
              <p>
                <strong>Описание:</strong> {order.description}
              </p>

              {/* Для грузодателя */}
              {order.orderType === "Грузодатель" && (
                <>
                  <p>
                    <strong>Вес:</strong> {order.weight ? order.weight : "—"}
                  </p>
                  <p>
                    <strong>Объем:</strong> {order.volume ? order.volume : "—"}
                  </p>
                  <p>
                    <strong>Город отправления:</strong>{" "}
                    {order.origin ? order.origin : "—"}
                  </p>
                  <p>
                    <strong>Город назначения:</strong>{" "}
                    {order.destination ? order.destination : "—"}
                  </p>
                </>
              )}

              {/* Для грузоперевозчика */}
              {order.orderType === "Грузоперевозчик" && (
                <>
                  <p>
                    <strong>Транспортное средство:</strong>{" "}
                    {order.vehicle ? order.vehicle : "—"}
                  </p>
                  <p>
                    <strong>Максимальная нагрузка:</strong>{" "}
                    {order.maxLoad ? order.maxLoad : "—"}
                  </p>
                  <p>
                    <strong>Город отправления:</strong>{" "}
                    {order.origin ? order.origin : "—"}
                  </p>
                  <p>
                    <strong>Город назначения:</strong>{" "}
                    {order.destination ? order.destination : "—"}
                  </p>
                </>
              )}

              {/* Для диспетчера */}
              {order.orderType === "Диспетчер" && (
                <p>
                  <strong>Комментарии диспетчера:</strong>{" "}
                  {order.dispatcherComments ? order.dispatcherComments : "—"}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
