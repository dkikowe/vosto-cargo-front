import React, { useState, useEffect, useContext } from "react";
import axios from "../../axios.js";
import s from "./Create.module.sass";
import { AddOrderModal } from "./AddOrderModal.jsx";
import { ThemeContext } from "../../context/ThemeContext";
import { Edit, Trash2 } from "lucide-react";

export default function CreateOrders() {
  const { theme } = useContext(ThemeContext);
  const userId = localStorage.getItem("id");

  const [currentType, setCurrentType] = useState("CargoOrder");
  const [currentTab, setCurrentTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Состояние редактируемой заявки (если null — создание новой)
  const [editingOrder, setEditingOrder] = useState(null);

  // Форма для создания/редактирования заявки
  const [formData, setFormData] = useState({
    description: "",
    loadingPlace: "",
    unloadingPlace: "",
    cargoName: "",
    volume: "",
    weight: "",
    temperature: "",
    bodyType: "",
    loadingType: "",
    TIR: false,
    CRM: false,
    medKnizhka: false,
    licensePlate: "",
    brandAndModel: "",
    machineType: "Грузовик",
    payloadCapacity: "",
    bodyVolume: "",
    loadingTypes: "",
    route: "",
    loadingDate: "",
    dateOption: "Постоянно",
    loadingPeriodFrom: "",
    loadingPeriodTo: "",
    EKMT: false,
    ADR: "",
    gpsMonitoring: false,
    paymentMethod: "",
    isArchived: false,
  });

  // Загружаем заказы
  const fetchUserOrders = async () => {
    try {
      if (!userId) return;
      const { data } = await axios.get(`/orders?userId=${userId}`);
      setOrders(data);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [userId]);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Сброс формы и сброс состояния "редактирования"
  const resetForm = () => {
    setFormData({
      description: "",
      loadingPlace: "",
      unloadingPlace: "",
      cargoName: "",
      volume: "",
      weight: "",
      temperature: "",
      bodyType: "",
      loadingType: "",
      TIR: false,
      CRM: false,
      medKnizhka: false,
      licensePlate: "",
      brandAndModel: "",
      machineType: "Грузовик",
      payloadCapacity: "",
      bodyVolume: "",
      loadingTypes: "",
      route: "",
      loadingDate: "",
      dateOption: "Постоянно",
      loadingPeriodFrom: "",
      loadingPeriodTo: "",
      EKMT: false,
      ADR: "",
      gpsMonitoring: false,
      paymentMethod: "",
      isArchived: false,
    });
    setEditingOrder(null);
  };

  // Функция для создания нового заказа
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const payload = {
      userId,
      orderType: currentType,
      description: formData.description,
      loadingPlace: formData.loadingPlace,
      unloadingPlace: formData.unloadingPlace,
      cargoName: formData.cargoName,
      volume: formData.volume ? Number(formData.volume) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      temperature: formData.temperature
        ? Number(formData.temperature)
        : undefined,
      bodyType: formData.bodyType,
      loadingType: formData.loadingType,
      TIR: formData.TIR,
      CRM: formData.CRM,
      medKnizhka: formData.medKnizhka,
      licensePlate: formData.licensePlate,
      brandAndModel: formData.brandAndModel,
      machineType: formData.machineType,
      payloadCapacity: formData.payloadCapacity
        ? Number(formData.payloadCapacity)
        : undefined,
      bodyVolume: formData.bodyVolume ? Number(formData.bodyVolume) : undefined,
      loadingTypes: formData.loadingTypes
        ? formData.loadingTypes.split(",").map((el) => el.trim())
        : [],
      route: formData.route,
      loadingDate: formData.loadingDate || undefined,
      dateOption: formData.dateOption,
      loadingPeriod: {
        from: formData.loadingPeriodFrom || undefined,
        to: formData.loadingPeriodTo || undefined,
      },
      EKMT: formData.EKMT,
      ADR: formData.ADR ? formData.ADR.split(",").map((el) => el.trim()) : [],
      gpsMonitoring: formData.gpsMonitoring,
      paymentMethod: formData.paymentMethod,
      isArchived: false,
    };

    try {
      const { data: savedOrder } = await axios.post("/orders", payload);
      console.log("Заявка успешно создана:", savedOrder);

      setShowForm(false);
      resetForm();
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка создания заявки:", error);
    }
  };

  // Функция для обновления существующего заказа
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!userId || !editingOrder) return;

    const payload = {
      userId,
      orderType: currentType,
      description: formData.description,
      loadingPlace: formData.loadingPlace,
      unloadingPlace: formData.unloadingPlace,
      cargoName: formData.cargoName,
      volume: formData.volume ? Number(formData.volume) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      temperature: formData.temperature
        ? Number(formData.temperature)
        : undefined,
      bodyType: formData.bodyType,
      loadingType: formData.loadingType,
      TIR: formData.TIR,
      CRM: formData.CRM,
      medKnizhka: formData.medKnizhka,
      licensePlate: formData.licensePlate,
      brandAndModel: formData.brandAndModel,
      machineType: formData.machineType,
      payloadCapacity: formData.payloadCapacity
        ? Number(formData.payloadCapacity)
        : undefined,
      bodyVolume: formData.bodyVolume ? Number(formData.bodyVolume) : undefined,
      loadingTypes: formData.loadingTypes
        ? formData.loadingTypes.split(",").map((el) => el.trim())
        : [],
      route: formData.route,
      loadingDate: formData.loadingDate || undefined,
      dateOption: formData.dateOption,
      loadingPeriod: {
        from: formData.loadingPeriodFrom || undefined,
        to: formData.loadingPeriodTo || undefined,
      },
      EKMT: formData.EKMT,
      ADR: formData.ADR ? formData.ADR.split(",").map((el) => el.trim()) : [],
      gpsMonitoring: formData.gpsMonitoring,
      paymentMethod: formData.paymentMethod,
      isArchived: false,
    };

    try {
      const { data: updatedOrder } = await axios.put(
        `/orders/${editingOrder._id}`, // <-- ID заявки в URL
        payload
      );
      console.log("Заявка успешно обновлена:", updatedOrder);

      setShowForm(false);
      resetForm();
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка обновления заявки:", error);
    }
  };

  // Общий onSubmit, который решает, нужно ли создавать или обновлять
  const handleSubmitOrder = (e) => {
    if (editingOrder) {
      handleUpdateOrder(e);
    } else {
      handleCreateOrder(e);
    }
  };

  // Архивирование / восстановление
  const handleToggleArchive = async (orderId, currentIsArchived) => {
    try {
      let updatedOrder;
      if (!currentIsArchived) {
        // Отправляем заказ в архив
        const response = await axios.post("/orders/archive", {
          orderId,
          userId,
        });
        updatedOrder = response.data;
        console.log("Заказ архивирован:", updatedOrder);
      } else {
        // Восстанавливаем заказ из архива
        const response = await axios.post("/orders/restore", {
          orderId,
          userId,
        });
        updatedOrder = response.data;
        console.log("Заказ восстановлен:", updatedOrder);
      }
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка обновления заявки:", error);
    }
  };

  // Заполнение формы при нажатии на «Редактировать»
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setCurrentType(order.orderType);

    setFormData({
      description: order.description || "",
      loadingPlace: order.loadingPlace || "",
      unloadingPlace: order.unloadingPlace || "",
      cargoName: order.cargoName || "",
      volume: order.volume || "",
      weight: order.weight || "",
      temperature: order.temperature || "",
      bodyType: order.bodyType || "",
      loadingType: order.loadingType || "",
      TIR: order.TIR || false,
      CRM: order.CRM || false,
      medKnizhka: order.medKnizhka || false,
      licensePlate: order.licensePlate || "",
      brandAndModel: order.brandAndModel || "",
      machineType: order.machineType || "Грузовик",
      payloadCapacity: order.payloadCapacity || "",
      bodyVolume: order.bodyVolume || "",
      loadingTypes: order.loadingTypes ? order.loadingTypes.join(", ") : "",
      route: order.route || "",
      loadingDate: order.loadingDate ? order.loadingDate.split("T")[0] : "",
      dateOption: order.dateOption || "Постоянно",
      loadingPeriodFrom: order.loadingPeriod?.from
        ? order.loadingPeriod.from.split("T")[0]
        : "",
      loadingPeriodTo: order.loadingPeriod?.to
        ? order.loadingPeriod.to.split("T")[0]
        : "",
      EKMT: order.EKMT || false,
      ADR: order.ADR ? order.ADR.join(", ") : "",
      gpsMonitoring: order.gpsMonitoring || false,
      paymentMethod: order.paymentMethod || "",
      isArchived: order.isArchived || false,
    });

    setShowForm(true);
  };

  // Удаление заявки
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete("/orders", {
        data: { userId, orderId },
      });
      console.log("Заявка удалена");
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
    }
  };

  // Фильтрация заявок
  const filteredOrders = orders.filter((order) => {
    const isRightType = order.orderType === currentType;
    const isRightArchive =
      currentTab === "archive" ? order.isArchived : !order.isArchived;
    return isRightType && isRightArchive;
  });

  // Визуальное смещение индикатора (Грузы / Машины)
  const typeIndicatorLeft = currentType === "CargoOrder" ? "0%" : "50%";

  // Логика кнопки "+"
  const handlePlusClick = () => {
    setShowMenu((prev) => !prev);
  };

  // Добавить груз
  const handleAddCargo = () => {
    setEditingOrder(null);
    setCurrentType("CargoOrder");
    resetForm();
    setShowForm(true);
    setShowMenu(false);
  };

  // Добавить машину
  const handleAddMachine = () => {
    setEditingOrder(null);
    setCurrentType("MachineOrder");
    resetForm();
    setShowForm(true);
    setShowMenu(false);
  };

  return (
    <div className={s.container + " " + (theme === "dark" ? s.dark : s.light)}>
      {/* Хедер с inline-стилем для изменения фона в зависимости от темы */}
      <div
        className={s.header}
        style={{
          backgroundColor: theme === "dark" ? "#121212" : undefined,
        }}
      >
        <div className={s.switch}>
          <div className={s.typeSwitcher}>
            <div
              className={s.switchIndicator}
              style={{ left: typeIndicatorLeft }}
            />
            <button
              className={
                currentType === "CargoOrder" ? s.activeText : s.switcher
              }
              onClick={() => setCurrentType("CargoOrder")}
            >
              Грузы
            </button>
            <button
              className={
                currentType === "MachineOrder" ? s.activeText : s.switcher
              }
              onClick={() => setCurrentType("MachineOrder")}
            >
              Машины
            </button>
          </div>
          <div className={s.plusWrapper}>
            <p className={s.plus} onClick={handlePlusClick}>
              +
            </p>
            {showMenu && (
              <div className={s.plusMenu}>
                <button className={s.plusButton} onClick={handleAddCargo}>
                  Добавить груз
                </button>
                <button className={s.plusButton} onClick={handleAddMachine}>
                  Добавить машину
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={s.statusButtons}>
          <button
            className={currentTab === "active" ? s.statusActive : s.statusItem}
            onClick={() => setCurrentTab("active")}
          >
            Опубликовано
          </button>
          <button
            className={
              currentTab === "archive" ? s.statusActiveArchive : s.archive
            }
            onClick={() => setCurrentTab("archive")}
          >
            Архив
          </button>
        </div>
      </div>
      <div className={s.ordersList}>
        {filteredOrders.length === 0 ? (
          <p>
            Здесь будут ваши {currentType === "CargoOrder" ? "грузы" : "машины"}
            . Добавьте их или восстановите из архива
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className={s.orderCard}
              style={{
                backgroundColor: theme === "dark" ? "#121212" : undefined,
              }}
            >
              {order.orderType === "CargoOrder" ? (
                <>
                  <p>
                    <strong>Груз:</strong> {order.cargoName || "—"}
                  </p>
                  <p>
                    <strong>Загрузка:</strong> {order.loadingPlace || "—"}
                  </p>
                  <p>
                    <strong>Выгрузка:</strong> {order.unloadingPlace || "—"}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Гос. номер:</strong> {order.licensePlate || "—"}
                  </p>
                  <p>
                    <strong>Марка и модель:</strong>{" "}
                    {order.brandAndModel || "—"}
                  </p>
                  <p>
                    <strong>Тип машины:</strong> {order.machineType || "—"}
                  </p>
                </>
              )}
              <div className={s.actions}>
                <button
                  onClick={() => handleEditOrder(order)}
                  title="Редактировать"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className={s.orderActions}>
                <button
                  onClick={() =>
                    handleToggleArchive(order._id, order.isArchived)
                  }
                >
                  {order.isArchived ? "Восстановить" : "В архив"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className={s.addButtonWrapper}>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm
            ? "Закрыть форму"
            : currentType === "CargoOrder"
            ? "Добавить груз"
            : "Добавить машину"}
        </button>
      </div>
      <AddOrderModal
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        currentType={currentType}
        formData={formData}
        onChange={handleChange}
        // Передаём общий onSubmit, который внутри решит, создавать или обновлять
        onSubmit={handleSubmitOrder}
      />
    </div>
  );
}
