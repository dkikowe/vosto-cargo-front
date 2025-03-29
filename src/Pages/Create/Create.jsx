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
    paymentMethod: "",
    isArchived: false,

    // CargoOrder
    from: "",
    to: "",
    cargo: "",
    weight: "",
    volume: "",
    rate: "",
    ready: "",
    vehicle: "",

    // MachineOrder
    url: "",
    marka: "",
    tip: "",
    kuzov: "",
    tip_zagruzki: "",
    gruzopodyomnost: "",
    vmestimost: "",
    data_gotovnosti: "",
    otkuda: "",
    kuda: "",
    telefon: "",
    imya: "",
    firma: "",
    gorod: "",
    pochta: "",
    company: "",
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

  // Сброс формы и состояния редактирования
  const resetForm = () => {
    setFormData({
      description: "",
      paymentMethod: "",
      isArchived: false,

      from: "",
      to: "",
      cargo: "",
      weight: "",
      volume: "",
      rate: "",
      ready: "",
      vehicle: "",

      url: "",
      marka: "",
      tip: "",
      kuzov: "",
      tip_zagruzki: "",
      gruzopodyomnost: "",
      vmestimost: "",
      data_gotovnosti: "",
      otkuda: "",
      kuda: "",
      telefon: "",
      imya: "",
      firma: "",
      gorod: "",
      pochta: "",
      company: "",
    });
    setEditingOrder(null);
  };

  // Функция для создания нового заказа
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!userId) return;

    let payload = {};
    if (currentType === "CargoOrder") {
      // Формируем payload для заявки на груз (CargoOrder)
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        from: formData.loadingPlace,
        to: formData.unloadingPlace,
        cargo: formData.cargoName,
        volume: formData.volume ? formData.volume.toString() : "",
        weight: formData.weight ? formData.weight.toString() : "",
        // Для этих полей можно оставить пустые строки, если их не вводят
        rate: "",
        ready: "",
        vehicle: "",
        paymentMethod: formData.paymentMethod,
        isArchived: false,
      };
    } else if (currentType === "MachineOrder") {
      // Разбиваем brandAndModel на marka и tip

      // Формируем payload для заявки на машину (MachineOrder)
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        marka: formData.marka,
        tip: formData.tip,
        kuzov: formData.kuzov,
        tip_zagruzki: formData.tip_zagruzki,
        gruzopodyomnost: formData.gruzopodyomnost
          ? formData.gruzopodyomnost.toString()
          : "",
        vmestimost: formData.vmestimost ? formData.vmestimost.toString() : "",
        data_gotovnosti: formData.data_gotovnosti,
        otkuda: formData.otkuda,
        kuda: formData.kuda,
        telefon: formData.telefon,
        imya: formData.contactName,
        firma: formData.contactFirm,
        gorod: formData.contactCity,
        pochta: formData.contactEmail,
        company: formData.company,
        paymentMethod: formData.paymentMethod,
        isArchived: false,
      };
    }

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

    let payload = {};
    if (currentType === "CargoOrder") {
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        from: formData.loadingPlace,
        to: formData.unloadingPlace,
        cargo: formData.cargoName,
        volume: formData.volume ? formData.volume.toString() : "",
        weight: formData.weight ? formData.weight.toString() : "",
        rate: "",
        ready: "",
        vehicle: "",
        paymentMethod: formData.paymentMethod,
        isArchived: false,
      };
    } else if (currentType === "MachineOrder") {
      payload = {
        marka: formData.marka,
        tip: formData.tip,
        userId,
        orderType: currentType,
        description: formData.description,

        kuzov: formData.kuzov,
        tip_zagruzki: formData.tip_zagruzki,
        gruzopodyomnost: formData.gruzopodyomnost
          ? formData.gruzopodyomnost.toString()
          : "",
        vmestimost: formData.vmestimost ? formData.vmestimost.toString() : "",
        data_gotovnosti: formData.data_gotovnosti,
        otkuda: formData.otkuda,
        kuda: formData.kuda,
        telefon: formData.telefon,
        imya: formData.contactName,
        firma: formData.contactFirm,
        gorod: formData.contactCity,
        pochta: formData.contactEmail,
        company: formData.company,
        paymentMethod: formData.paymentMethod,
        isArchived: false,
      };
    }

    try {
      const { data: updatedOrder } = await axios.put(
        `/orders/${editingOrder._id}`,
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

  // Общий onSubmit, который решает, создавать или обновлять
  const handleSubmitOrder = (e) => {
    if (editingOrder) {
      handleUpdateOrder(e);
    } else {
      handleCreateOrder(e);
    }
  };

  // Архивирование / восстановление заказа
  const handleToggleArchive = async (orderId, currentIsArchived) => {
    try {
      let updatedOrder;
      if (!currentIsArchived) {
        const response = await axios.post("/orders/archive", {
          orderId,
          userId,
        });
        updatedOrder = response.data;
        console.log("Заказ архивирован:", updatedOrder);
      } else {
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

  // Заполнение формы при нажатии «Редактировать»
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setCurrentType(order.orderType);

    setFormData({
      description: order.description || "",
      loadingPlace: order.from || "",
      unloadingPlace: order.to || "",
      cargoName: order.cargo || "",
      volume: order.volume || "",
      weight: order.weight || "",
      // Для заявки на груз больше никаких полей нет

      // Для машины:
      licensePlate: order.licensePlate || "",
      brandAndModel: order.brandAndModel || "", // на бэкенде разделится на marka и tip
      kuzov: order.kuzov || "",
      tip_zagruzki: order.tip_zagruzki || "",
      gruzopodyomnost: order.gruzopodyomnost || "",
      vmestimost: order.vmestimost || "",
      data_gotovnosti: order.data_gotovnosti || "",
      otkuda: order.otkuda || "",
      kuda: order.kuda || "",
      telefon: order.telefon || "",
      contactName: order.imya || "",
      contactFirm: order.firma || "",
      contactCity: order.gorod || "",
      contactEmail: order.pochta || "",
      company: order.company || "",

      paymentMethod: order.paymentMethod || "",
      isArchived: order.isArchived || false,
    });

    setShowForm(true);
  };

  // Удаление заказа
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
    <div className={`${s.container} ${theme === "dark" ? s.dark : s.light}`}>
      <div
        className={s.header}
        style={{ backgroundColor: theme === "dark" ? "#121212" : undefined }}
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
                    <strong>Марка и тип:</strong> {order.marka} {order.tip}
                  </p>
                  <p>
                    <strong>Откуда:</strong> {order.otkuda || "—"}
                  </p>
                  <p>
                    <strong>Куда:</strong> {order.kuda || "—"}
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
        onSubmit={handleSubmitOrder}
      />
    </div>
  );
}
