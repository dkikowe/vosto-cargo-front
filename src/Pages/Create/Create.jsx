import React, { useState, useEffect, useContext } from "react";
import axios from "../../axios.js";
import s from "./Create.module.sass";
import { AddOrderModal } from "./AddOrderModal.jsx";
import { ThemeContext } from "../../context/ThemeContext";
import { Edit, Trash2, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import BottomSheetModal from "./components/BottomSheetModal";
import AddCargoStepper from "./components/AddCargoStepper";

export default function CreateOrders() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const userId = localStorage.getItem("id");

  const [currentTab, setCurrentTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

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
    if (currentTab === "CargoOrder") {
      payload = {
        userId,
        orderType: currentTab,
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
    } else if (currentTab === "MachineOrder") {
      payload = {
        userId,
        orderType: currentTab,
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
    if (currentTab === "CargoOrder") {
      payload = {
        userId,
        orderType: currentTab,
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
    } else if (currentTab === "MachineOrder") {
      payload = {
        userId,
        orderType: currentTab,
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
    setCurrentTab(order.orderType);
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
      (currentTab === "archive" ? order.isArchived : !order.isArchived) &&
      (filterType === "all" ||
        (filterType === "cargo" && order.orderType === "CargoOrder") ||
        (filterType === "machine" && order.orderType === "MachineOrder"))
  );

  return (
    <div className={`${s.container} ${theme === "dark" ? s.dark : s.light}`}>
      <div
        className={s.header}
        style={{ backgroundColor: theme === "dark" ? "#121212" : undefined }}
      >
        <h1>Мои заявки</h1>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div className={s.statusButtons}>
          <button
            className={currentTab === "active" ? s.statusActive : s.statusItem}
            onClick={() => setCurrentTab("active")}
          >
            <img src="/images/design-icons-create/public.svg" alt="" />
            {t("orders.published")}
          </button>
          <button
            className={
              currentTab === "archive" ? s.statusActiveArchive : s.archive
            }
            onClick={() => setCurrentTab("archive")}
          >
            <img src="/images/design-icons-create/archive.svg" alt="" />
            {t("orders.archive")}
          </button>
        </div>
        <div
          style={{
            position: "relative",
            marginLeft: "auto",
            marginRight: 16,
          }}
        >
          <img
            src="/images/design-icons-create/filter.svg"
            style={{ cursor: "pointer" }}
            onClick={() => setShowFilter((v) => !v)}
            alt=""
          />

          {showFilter && (
            <div
              style={{
                position: "absolute",
                top: 36,
                right: 0,
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                borderRadius: 16,
                padding: "12px 0",
                zIndex: 10,
                minWidth: 180,
              }}
            >
              <div
                onClick={() => {
                  setFilterType("all");
                  setShowFilter(false);
                }}
                style={{
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontWeight: filterType === "all" ? "bold" : "normal",
                  color: "#222",
                  background: filterType === "all" ? "#f5f5f5" : "transparent",
                }}
              >
                Все заявки {filterType === "all" && "✓"}
              </div>
              <div
                onClick={() => {
                  setFilterType("cargo");
                  setShowFilter(false);
                }}
                style={{
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontWeight: filterType === "cargo" ? "bold" : "normal",
                  color: "#222",
                  background:
                    filterType === "cargo" ? "#f5f5f5" : "transparent",
                }}
              >
                Только грузы {filterType === "cargo" && "✓"}
              </div>
              <div
                onClick={() => {
                  setFilterType("machine");
                  setShowFilter(false);
                }}
                style={{
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontWeight: filterType === "machine" ? "bold" : "normal",
                  color: "#222",
                  background:
                    filterType === "machine" ? "#f5f5f5" : "transparent",
                }}
              >
                Только автомобили {filterType === "machine" && "✓"}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={s.ordersList}>
        {filteredOrders.length === 0 ? (
          <p>
            {t("orders.empty", {
              type: t(
                currentTab === "CargoOrder"
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
            : currentTab === "CargoOrder"
            ? t("orders.addCargo")
            : t("orders.addMachine")}
        </button>
      </div>
      <BottomSheetModal
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
      >
        {currentTab === "CargoOrder" && (
          <AddCargoStepper
            onSubmit={(data) => {
              // TODO: обработка отправки (можно вызвать handleCreateOrder)
              setShowForm(false);
              resetForm();
              // handleCreateOrder(data) — если нужно
            }}
            onClose={() => {
              setShowForm(false);
              resetForm();
            }}
          />
        )}
        {/* Для MachineOrder аналогично — AddMachineStepper */}
      </BottomSheetModal>
    </div>
  );
}
