import React from "react";
import { Edit, Trash2 } from "lucide-react";
import s from "./OrderCard.module.sass";

export const OrderCard = ({
  order,
  theme,
  onEdit,
  onDelete,
  onToggleArchive,
}) => {
  return (
    <div
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
            <strong>Марка и модель:</strong> {order.brandAndModel || "—"}
          </p>
          <p>
            <strong>Тип машины:</strong> {order.machineType || "—"}
          </p>
        </>
      )}
      <div className={s.actions}>
        <button onClick={() => onEdit(order)} title="Редактировать">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(order._id)} title="Удалить">
          <Trash2 size={16} />
        </button>
      </div>
      <div className={s.orderActions}>
        <button onClick={() => onToggleArchive(order._id, order.isArchived)}>
          {order.isArchived ? "Восстановить" : "В архив"}
        </button>
      </div>
    </div>
  );
};
