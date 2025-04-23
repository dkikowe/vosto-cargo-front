import React, { useState, useEffect, useContext } from "react";
import axios from "../../axios.js";
import s from "./Create.module.sass";
import { AddOrderModal } from "./AddOrderModal.jsx";
import { ThemeContext } from "../../context/ThemeContext";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CreateOrders() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const userId = localStorage.getItem("id");

  const [currentType, setCurrentType] = useState("CargoOrder");
  const [currentTab, setCurrentTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [formData, setFormData] = useState({
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
    readyFrom: "",
    readyTo: "",
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!userId) return;

    function formatShortDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${day}.${month}`;
    }

    let payload = {};
    if (currentType === "CargoOrder") {
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        from: formData.from,
        to: formData.to,
        cargo: formData.cargo,
        volume: formData.volume ? formData.volume.toString() : "",
        weight: formData.weight ? formData.weight.toString() : "",
        rate: formData.rate || "",
        ready:
          `${formatShortDate(formData.readyFrom)} - ${formatShortDate(
            formData.readyTo
          )}` || "",
        telefon: formData.telefon || "",
        vehicle: formData.vehicle || "",
        paymentMethod: formData.paymentMethod,
        isArchived: false,
      };
    } else if (currentType === "MachineOrder") {
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        marka: formData.marka,
        tip: formData.tip,
        kuzov: formData.kuzov,
        tip_zagruzki: formData.tip_zagruzki,
        gruzopodyomnost: formData.gruzopodyomnost?.toString() || "",
        vmestimost: formData.vmestimost?.toString() || "",
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

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!userId || !editingOrder) return;

    let payload = {};
    if (currentType === "CargoOrder") {
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        from: formData.from,
        to: formData.to,
        cargo: formData.cargo,
        volume: formData.volume?.toString() || "",
        weight: formData.weight?.toString() || "",
        rate: "",
        ready: "",
        vehicle: "",
        paymentMethod: formData.paymentMethod,
        isArchived: false,
      };
    } else if (currentType === "MachineOrder") {
      payload = {
        userId,
        orderType: currentType,
        description: formData.description,
        marka: formData.marka,
        tip: formData.tip,
        kuzov: formData.kuzov,
        tip_zagruzki: formData.tip_zagruzki,
        gruzopodyomnost: formData.gruzopodyomnost?.toString() || "",
        vmestimost: formData.vmestimost?.toString() || "",
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

  const handleSubmitOrder = (e) => {
    editingOrder ? handleUpdateOrder(e) : handleCreateOrder(e);
  };

  const handleToggleArchive = async (orderId, currentIsArchived) => {
    try {
      const endpoint = currentIsArchived
        ? "/orders/restore"
        : "/orders/archive";
      const { data: updatedOrder } = await axios.post(endpoint, {
        orderId,
        userId,
      });
      console.log(
        currentIsArchived ? "Заявка восстановлена" : "Заявка архивирована",
        updatedOrder
      );
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка обновления заявки:", error);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setCurrentType(order.orderType);
    setFormData({
      description: order.description || "",
      from: order.from || "",
      to: order.to || "",
      cargo: order.cargo || "",
      volume: order.volume || "",
      weight: order.weight || "",
      marka: order.marka || "",
      tip: order.tip || "",
      kuzov: order.kuzov || "",
      tip_zagruzki: order.tip_zagruzki || "",
      gruzopodyomnost: order.gruzopodyomnost || "",
      vmestimost: order.vmestimost || "",
      data_gotovnosti: order.data_gotovnosti || "",
      otkuda: order.otkuda || "",
      kuda: order.kuda || "",
      telefon: order.telefon || "",
      imya: order.imya || "",
      firma: order.firma || "",
      gorod: order.gorod || "",
      pochta: order.pochta || "",
      company: order.company || "",
      paymentMethod: order.paymentMethod || "",
      isArchived: order.isArchived || false,
    });
    setShowForm(true);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete("/orders", { data: { userId, orderId } });
      console.log("Заявка удалена");
      fetchUserOrders();
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderType === currentType &&
      (currentTab === "archive" ? order.isArchived : !order.isArchived)
  );

  const handleAddCargo = () => {
    setEditingOrder(null);
    setCurrentType("CargoOrder");
    resetForm();
    setShowForm(true);
    setShowMenu(false);
  };

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
              style={{ left: currentType === "CargoOrder" ? "0%" : "50%" }}
            />
            <button
              className={
                currentType === "CargoOrder" ? s.activeText : s.switcher
              }
              onClick={() => setCurrentType("CargoOrder")}
            >
              {t("orders.cargo")}
            </button>
            <button
              className={
                currentType === "MachineOrder" ? s.activeText : s.switcher
              }
              onClick={() => setCurrentType("MachineOrder")}
            >
              {t("orders.machine")}
            </button>
          </div>
          <div className={s.plusWrapper}>
            <p className={s.plus} onClick={() => setShowMenu((prev) => !prev)}>
              +
            </p>
            {showMenu && (
              <div className={s.plusMenu}>
                <button className={s.plusButton} onClick={handleAddCargo}>
                  {t("orders.addCargo")}
                </button>
                <button className={s.plusButton} onClick={handleAddMachine}>
                  {t("orders.addMachine")}
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
            {t("orders.published")}
          </button>
          <button
            className={
              currentTab === "archive" ? s.statusActiveArchive : s.archive
            }
            onClick={() => setCurrentTab("archive")}
          >
            {t("orders.archive")}
          </button>
        </div>
      </div>
      <div className={s.ordersList}>
        {filteredOrders.length === 0 ? (
          <p>
            {t("orders.empty", {
              type: t(
                currentType === "CargoOrder"
                  ? "orders.cargoPlural"
                  : "orders.machinePlural"
              ),
            })}
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
                    <strong>{t("orders.cargo")}:</strong> {order.cargo || "—"}
                  </p>
                  <p>
                    <strong>{t("orders.from")}:</strong> {order.from || "—"}
                  </p>
                  <p>
                    <strong>{t("orders.to")}:</strong> {order.to || "—"}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>{t("orders.brandAndType")}:</strong> {order.marka}{" "}
                    {order.tip}
                  </p>
                  <p>
                    <strong>{t("orders.from")}:</strong> {order.otkuda || "—"}
                  </p>
                  <p>
                    <strong>{t("orders.to")}:</strong> {order.kuda || "—"}
                  </p>
                </>
              )}
              <div className={s.actions}>
                <button
                  onClick={() => handleEditOrder(order)}
                  title={t("orders.edit")}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  title={t("orders.delete")}
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
                  {order.isArchived ? t("orders.restore") : t("orders.archive")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className={s.addButtonWrapper}>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm
            ? t("orders.closeForm")
            : currentType === "CargoOrder"
            ? t("orders.addCargo")
            : t("orders.addMachine")}
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
