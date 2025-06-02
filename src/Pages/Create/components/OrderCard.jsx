import React, { useState, useEffect, useContext } from "react";
import s from "../../Main/Main.module.sass";
import { Edit, Trash2 } from "lucide-react";
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

  // -------------------- CARGO --------------------
  if (isCargo) {
    return (
      <div className={`${s.card} ${s.cargoCard}`}>
        <div className={s.cardHeaderCargo}>
          <div className={s.cardTitleRow}>
            <h1 className={s.cardTitle}>
              {order.from} — {order.to}
            </h1>
            <div className={s.cardBoxIcon}>
              <img src="/images/design-icons-main/cargo.svg" alt="" />
            </div>
          </div>
          <div className={s.cardInfoRow}>
            <div className={s.cardDate}>
              <img src="/images/design-icons-main/date.svg" alt="" />
              <span>{order.ready}</span>
            </div>
            {order.rate && (
              <div className={s.cardRate}>
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
          <div className={s.cardDetailsContent}>
            <div className={s.cardCustomerLabel}>Заказчик</div>
            <div className={s.cardCustomer}>{order.customerName || "—"}</div>
            {order.telefon && (
              <div className={s.cardPhone}>
                <a href={`tel:${order.telefon}`}>{order.telefon}</a>
              </div>
            )}
            <div className={s.cardRouteBlock}>
              <div className={s.cardRouteBlockTitle}>
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{order.from}</span>
              </div>
              <img src="/images/design-icons-main/between.svg" alt="" />
              <div className={s.cardRouteBlockTitle}>
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{order.to}</span>
              </div>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.cardMapLink}
                >
                  Показать маршрут на карте
                </a>
              )}
            </div>
            <div className={s.cardTagsRow}>
              {order.cargo && (
                <div className={s.cardTag}>
                  <img
                    src="/images/design-icons-main/cargo-detail.svg"
                    alt=""
                  />
                  {order.cargo}
                </div>
              )}
              {order.weight && (
                <div className={s.cardTag}>
                  <img src="/images/design-icons-main/baggage.svg" alt="" />
                  {order.weight}
                </div>
              )}
              {order.volume && (
                <div className={s.cardTag}>
                  <img src="/images/design-icons-main/expand.svg" alt="" />
                  {order.volume} м³
                </div>
              )}
              {order.vehicle && (
                <div className={s.cardTag}>
                  <img src="/images/design-icons-main/gruzocar.svg" alt="" />
                  {order.vehicle}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => onEdit(order)}
                title="Редактировать"
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                }}
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(order._id)}
                title="Удалить"
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => onToggleArchive(order._id, order.isArchived)}
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
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
  return (
    <div className={`${s.card} ${s.cargoCard}`}>
      <div className={s.cardHeaderCargo}>
        <div className={s.cardTitleRow}>
          <h1 className={s.cardTitle}>
            {order.otkuda} — {order.kuda}
          </h1>
          <div className={s.cardBoxIcon}>
            <img src="/images/design-icons-main/gruzocar.svg" alt="" />
          </div>
        </div>
        <div className={s.cardInfoRow}>
          <div className={s.cardDate}>
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
        <div className={s.cardDetailsContent}>
          <div className={s.cardCustomerLabel}>Заказчик</div>
          <div className={s.cardCustomer}>{order.imya || "—"}</div>
          {order.firma && <div className={s.cardCustomer}>({order.firma})</div>}
          {order.telefon && (
            <div className={s.cardPhone}>
              <a href={`tel:${order.telefon}`}>{order.telefon}</a>
            </div>
          )}
          <div className={s.cardRouteBlock}>
            <div className={s.cardRouteBlockTitle}>
              <img src="/images/design-icons-main/place.svg" alt="" />
              <span>{order.otkuda}</span>
            </div>
            <img src="/images/design-icons-main/between.svg" alt="" />
            <div className={s.cardRouteBlockTitle}>
              <img src="/images/design-icons-main/place.svg" alt="" />
              <span>{order.kuda}</span>
            </div>
          </div>
          <div className={s.cardTagsRow}>
            {order.marka && order.tip && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/gruzocar.svg" alt="" />
                {order.marka} {order.tip}
              </div>
            )}
            {order.kuzov && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/cargo-detail.svg" alt="" />
                {order.kuzov}
              </div>
            )}
            {order.tip_zagruzki && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/baggage.svg" alt="" />
                {order.tip_zagruzki}
              </div>
            )}
            {order.gruzopodyomnost && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/expand.svg" alt="" />
                {order.gruzopodyomnost} т
              </div>
            )}
            {order.vmestimost && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/expand.svg" alt="" />
                {order.vmestimost} м³
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              onClick={() => onEdit(order)}
              title="Редактировать"
              style={{
                background: "#f5f5f5",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
              }}
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(order._id)}
              title="Удалить"
              style={{
                background: "#f5f5f5",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
              }}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => onToggleArchive(order._id, order.isArchived)}
              style={{
                background: "#f5f5f5",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
              }}
            >
              {order.isArchived ? "Восстановить" : "В архив"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
