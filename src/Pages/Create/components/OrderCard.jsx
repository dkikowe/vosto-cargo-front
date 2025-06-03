import React, { useState, useEffect, useContext } from "react";
import s from "../../Main/Main.module.sass";
import {
  Edit,
  Trash2,
  Settings,
  Truck,
  Box,
  ArchiveRestore,
} from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";

export const OrderCard = ({
  order,
  theme,
  onEdit,
  onDelete,
  onToggleArchive,
}) => {
  const isCargo = order.orderType === "CargoOrder";
  const [showDetails, setShowDetails] = useState(false);
  const [mapLink, setMapLink] = useState(null);
  const { from, to, otkuda, kuda } = order;
  const [showMenu, setShowMenu] = useState(false);

  const isDark = theme === "dark";
  const cardStyle = {
    position: "relative",
    background: isDark ? "#1A1A1A" : "#fff",
    color: isDark ? "#fff" : "#000",
    boxShadow: isDark
      ? "0px 0px 55px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: isDark ? "none" : undefined,
  };
  const iconMain = isDark ? "#8CA3C2" : "#053576";
  const iconEdit = isDark ? "#8CA3C2" : "#3a5c9f";
  const iconDelete = "#d32f2f";
  const iconArchive = isDark ? "#888" : "#053576";
  const textSecondary = isDark ? "#b0b0b0" : "#888";
  const hrColor = isDark ? "#353b45" : "#eee";
  const menuBg = isDark ? "#23272f" : "#fff";
  const menuShadow = isDark
    ? "0 2px 12px rgba(0,0,0,0.32)"
    : "0 2px 12px rgba(0,0,0,0.12)";

  useEffect(() => {
    const fetchMapLink = async () => {
      if (order.from && order.to) {
        try {
          const response = await fetch(
            `/api/distance?cityA=${order.from}&cityB=${order.to}`
          );
          const data = await response.json();
          setMapLink(data.routeUrl);
        } catch (error) {
          setMapLink(null);
        }
      }
    };
    if (isCargo) fetchMapLink();
  }, [order.from, order.to, isCargo]);

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  }

  // -------------------- CARGO --------------------
  if (isCargo) {
    return (
      <div style={cardStyle}>
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
            onClick={() => setShowMenu((v) => !v)}
          >
            <Settings size={20} color={iconMain} />
          </button>
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: 28,
                right: 0,
                background: menuBg,
                boxShadow: menuShadow,
                borderRadius: 8,
                padding: "8px 0",
                zIndex: 10,
                minWidth: 120,
              }}
            >
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: iconEdit,
                }}
                onClick={() => {
                  setShowMenu(false);
                  onEdit(order);
                }}
              >
                <Edit size={18} color={iconEdit} />
                Редактировать
              </button>
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: iconDelete,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => {
                  setShowMenu(false);
                  onDelete(order._id);
                }}
              >
                <Trash2 size={18} color={iconDelete} />
                Удалить
              </button>
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: iconArchive,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => {
                  setShowMenu(false);
                  onToggleArchive(order._id, order.isArchived);
                }}
              >
                <ArchiveRestore size={18} color={iconArchive} />
                {order.isArchived ? "Восстановить" : "В архив"}
              </button>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 0 16px",
          }}
        >
          <Box size={32} color={iconMain} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: isDark ? "#fff" : "#000",
              }}
            >
              Груз
            </span>
            <span style={{ color: textSecondary, fontSize: 14, marginTop: 2 }}>
              Дата публикации: {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
        <hr
          style={{
            margin: "16px 0 0 0",
            border: 0,
            borderTop: `1px solid ${hrColor}`,
          }}
        />
        <div style={{ padding: "18px", paddingBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1
              style={{
                fontWeight: 600,
                fontSize: 20,
                color: isDark ? "#fff" : "#000",
              }}
            >
              {order.from} — {order.to}
            </h1>
            <div>
              <Box size={28} color={iconMain} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
            }}
          >
            <div
              style={{
                color: textSecondary,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <img src="/images/design-icons-main/date.svg" alt="" />
              <span>{order.ready}</span>
            </div>
            {order.rate && (
              <div
                style={{
                  color: textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <img src="/images/design-icons-main/coins.svg" alt="" />
                <span>{order.rate}</span>
              </div>
            )}
          </div>
        </div>
        <div className={s.cardDetailsToggle}>
          <button
            className={s.cardDetailsBtn}
            onClick={() => setShowDetails((v) => !v)}
          >
            <span>{showDetails ? "Скрыть детали" : "Подробнее о заявке"}</span>
            <span className={showDetails ? s.cardArrowOpen : s.cardArrow}>
              <svg
                width="24"
                height="24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="#053576"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
        {showDetails && (
          <div
            className={s.cardDetailsContent}
            style={isDark ? { color: "#fff" } : {}}
          >
            <div
              className={s.cardCustomerLabel}
              style={isDark ? { color: "#fff" } : {}}
            >
              Заказчик
            </div>
            <div
              className={s.cardCustomer}
              style={isDark ? { color: "#fff" } : {}}
            >
              {order.customerName || "—"}
            </div>
            {order.telefon && (
              <div
                className={s.cardPhone}
                style={isDark ? { color: "#fff" } : {}}
              >
                <a
                  href={`tel:${order.telefon}`}
                  style={isDark ? { color: "#8CA3C2" } : {}}
                >
                  {order.telefon}
                </a>
              </div>
            )}
            <div className={s.cardRouteBlock}>
              <div
                className={s.cardRouteBlockTitle}
                style={isDark ? { color: "#fff" } : {}}
              >
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{order.from}</span>
              </div>
              <img src="/images/design-icons-main/between.svg" alt="" />
              <div
                className={s.cardRouteBlockTitle}
                style={isDark ? { color: "#fff" } : {}}
              >
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{order.to}</span>
              </div>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.cardMapLink}
                  style={isDark ? { color: "#8CA3C2" } : {}}
                >
                  Показать маршрут на карте
                </a>
              )}
            </div>
            <div className={s.cardTagsRow}>
              {order.cargo && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img
                    src="/images/design-icons-main/cargo-detail.svg"
                    alt=""
                  />
                  {order.cargo}
                </div>
              )}
              {order.weight && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/baggage.svg" alt="" />
                  {order.weight}
                </div>
              )}
              {order.volume && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/expand.svg" alt="" />
                  {order.volume} м³
                </div>
              )}
              {order.vehicle && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/gruzocar.svg" alt="" />
                  {order.vehicle}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => onToggleArchive(order._id, order.isArchived)}
                style={{
                  background: isDark ? "#23272f" : "#f5f5f5",
                  border: "none",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                  color: isDark ? "#fff" : undefined,
                }}
              >
                {order.isArchived ? "Восстановить" : "В архив"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------- MACHINE --------------------
  if (!isCargo) {
    return (
      <div style={cardStyle}>
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
            onClick={() => setShowMenu((v) => !v)}
          >
            <Settings size={20} color={iconMain} />
          </button>
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: 28,
                right: 0,
                background: menuBg,
                boxShadow: menuShadow,
                borderRadius: 8,
                padding: "8px 0",
                zIndex: 10,
                minWidth: 120,
              }}
            >
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: iconEdit,
                }}
                onClick={() => {
                  setShowMenu(false);
                  onEdit(order);
                }}
              >
                <Edit size={18} color={iconEdit} />
                Редактировать
              </button>
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: iconDelete,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => {
                  setShowMenu(false);
                  onDelete(order._id);
                }}
              >
                <Trash2 size={18} color={iconDelete} />
                Удалить
              </button>
              <button
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: iconArchive,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => {
                  setShowMenu(false);
                  onToggleArchive(order._id, order.isArchived);
                }}
              >
                <ArchiveRestore size={18} color={iconArchive} />
                {order.isArchived ? "Восстановить" : "В архив"}
              </button>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 0 16px",
          }}
        >
          <Truck size={32} color={iconMain} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: isDark ? "#fff" : "#000",
              }}
            >
              Машина
            </span>
            <span style={{ color: textSecondary, fontSize: 14, marginTop: 2 }}>
              Дата публикации: {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
        <hr
          style={{
            margin: "16px 0 0 0",
            border: 0,
            borderTop: `1px solid ${hrColor}`,
          }}
        />
        <div style={{ padding: "18px", paddingBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1
              style={{
                fontWeight: 600,
                fontSize: 20,
                color: isDark ? "#fff" : "#000",
              }}
            >
              {order.otkuda} — {order.kuda}
            </h1>
            <div>
              <Truck size={28} color={iconMain} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
            }}
          >
            <div
              style={{
                color: textSecondary,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <img src="/images/design-icons-main/date.svg" alt="" />
              <span>{order.data_gotovnosti}</span>
            </div>
          </div>
        </div>
        <div className={s.cardDetailsToggle}>
          <button
            className={s.cardDetailsBtn}
            onClick={() => setShowDetails((v) => !v)}
          >
            <span>{showDetails ? "Скрыть детали" : "Подробнее о заявке"}</span>
            <span className={showDetails ? s.cardArrowOpen : s.cardArrow}>
              <svg
                width="24"
                height="24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="#053576"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
        {showDetails && (
          <div
            className={s.cardDetailsContent}
            style={isDark ? { color: "#fff" } : {}}
          >
            <div
              className={s.cardCustomerLabel}
              style={isDark ? { color: "#fff" } : {}}
            >
              Заказчик
            </div>
            <div
              className={s.cardCustomer}
              style={isDark ? { color: "#fff" } : {}}
            >
              {order.imya || "—"}
            </div>
            {order.firma && (
              <div className={s.cardCustomer}>({order.firma})</div>
            )}
            {order.telefon && (
              <div
                className={s.cardPhone}
                style={isDark ? { color: "#fff" } : {}}
              >
                <a
                  href={`tel:${order.telefon}`}
                  style={isDark ? { color: "#8CA3C2" } : {}}
                >
                  {order.telefon}
                </a>
              </div>
            )}
            <div className={s.cardRouteBlock}>
              <div
                className={s.cardRouteBlockTitle}
                style={isDark ? { color: "#fff" } : {}}
              >
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{order.otkuda}</span>
              </div>
              <img src="/images/design-icons-main/between.svg" alt="" />
              <div
                className={s.cardRouteBlockTitle}
                style={isDark ? { color: "#fff" } : {}}
              >
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{order.kuda}</span>
              </div>
            </div>
            <div className={s.cardTagsRow}>
              {order.marka && order.tip && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/gruzocar.svg" alt="" />
                  {order.marka} {order.tip}
                </div>
              )}
              {order.kuzov && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img
                    src="/images/design-icons-main/cargo-detail.svg"
                    alt=""
                  />
                  {order.kuzov}
                </div>
              )}
              {order.tip_zagruzki && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/baggage.svg" alt="" />
                  {order.tip_zagruzki}
                </div>
              )}
              {order.gruzopodyomnost && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/expand.svg" alt="" />
                  {order.gruzopodyomnost} т
                </div>
              )}
              {order.vmestimost && (
                <div
                  className={s.cardTag}
                  style={isDark ? { color: "#fff" } : {}}
                >
                  <img src="/images/design-icons-main/expand.svg" alt="" />
                  {order.vmestimost} м³
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => onToggleArchive(order._id, order.isArchived)}
                style={{
                  background: isDark ? "#23272f" : "#f5f5f5",
                  border: "none",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                  color: isDark ? "#fff" : undefined,
                }}
              >
                {order.isArchived ? "Восстановить" : "В архив"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};
