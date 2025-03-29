import React, { useState, useEffect } from "react";
import s from "../Main.module.sass";
import axios from "../../../axios";

// ------------------------- Card (не меняем) -------------------------
export const Card = ({ data }) => {
  const isCargo = Boolean(data.cargo);

  if (isCargo) {
    return (
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h3>{data.cargo || "Без названия груза"}</h3>
          <span className={s.date}>{data.ready}</span>
        </div>

        <div className={s.cardBody}>
          <div className={s.cardRow}>
            <span className={s.label}>Вес:</span>
            <span>{data.weight || "—"}</span>
          </div>
          <div className={s.cardRow}>
            <span className={s.label}>Объём:</span>
            <span>{data.volume || "—"}</span>
          </div>
          <div className={s.cardRow}>
            <span className={s.label}>Ставка:</span>
            <span>{data.rate || "—"}</span>
          </div>
          <div className={s.cardRow}>
            <span className={s.label}>Тип ТС:</span>
            <span>{data.vehicle || "—"}</span>
          </div>

          <div className={s.cardRoute}>
            <div>
              <span className={s.label}>Откуда:</span>
              <p>{data.from || "—"}</p>
            </div>
            <div>
              <span className={s.label}>Куда:</span>
              <p>{data.to || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h3>
            {data.marka || "Без марки"} {data.tip || ""}
          </h3>
          <span className={s.date}>{data.data_gotovnosti || ""}</span>
        </div>

        <div className={s.cardBody}>
          <div className={s.cardRow}>
            <span className={s.label}>Кузов:</span>
            <span>{data.kuzov || "—"}</span>
          </div>
          <div className={s.cardRow}>
            <span className={s.label}>Тип загрузки:</span>
            <span>{data.tip_zagruzki || "—"}</span>
          </div>
          <div className={s.cardRow}>
            <span className={s.label}>Грузоподъемность:</span>
            <span>{data.gruzopodyomnost || "—"}</span>
          </div>
          <div className={s.cardRow}>
            <span className={s.label}>Вместимость:</span>
            <span>{data.vmestimost || "—"}</span>
          </div>

          <div className={s.cardRoute}>
            <div>
              <span className={s.label}>Откуда:</span>
              <p>{data.otkuda || "—"}</p>
            </div>
            <div>
              <span className={s.label}>Куда:</span>
              <p>{data.kuda || "—"}</p>
            </div>
          </div>

          <div className={s.cardContact}>
            <div>
              <span className={s.label}>Контакт:</span>
              <p>
                {data.imya || "—"} {data.firma ? `(${data.firma})` : ""}
              </p>
              <p>Тел: {data.telefon || "—"}</p>
            </div>
          </div>
        </div>

        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className={s.cardLink}
          >
            Подробнее
          </a>
        )}
      </div>
    );
  }
};

// ------------------------- ParserSwitcher (без пагинации) -------------------------
export const ParserSwitcher = ({ theme }) => {
  const [currentType, setCurrentType] = useState("CargoOrder");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Состояния для расширенных фильтров
  const [cargoFilter, setCargoFilter] = useState({
    cargo: "",
    from: "",
    to: "",
  });
  const [machineFilter, setMachineFilter] = useState({
    marka: "",
    otkuda: "",
    kuda: "",
  });

  const handleParse = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/allOrders");
      setResult(data);
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleParse();
  }, []);

  const typeIndicatorLeft = currentType === "CargoOrder" ? "0%" : "50%";

  if (isLoading) {
    return (
      <>
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
          </div>
        </div>
        <div className={s.loading}>Загрузка...</div>
      </>
    );
  }

  if (!result) {
    return <div className={s.placeholder}>Нет данных для отображения</div>;
  }

  // Фильтрация по типу заявки
  let filtered = result.filter(
    (item) => item.orderType === currentType && !item.isArchived
  );

  // Дополнительная фильтрация в зависимости от типа заявки
  if (currentType === "CargoOrder") {
    if (cargoFilter.cargo) {
      filtered = filtered.filter(
        (item) =>
          item.cargo &&
          item.cargo.toLowerCase().includes(cargoFilter.cargo.toLowerCase())
      );
    }
    if (cargoFilter.from) {
      filtered = filtered.filter(
        (item) =>
          item.from &&
          item.from.toLowerCase().includes(cargoFilter.from.toLowerCase())
      );
    }
    if (cargoFilter.to) {
      filtered = filtered.filter(
        (item) =>
          item.to &&
          item.to.toLowerCase().includes(cargoFilter.to.toLowerCase())
      );
    }
  } else {
    if (machineFilter.marka) {
      filtered = filtered.filter(
        (item) =>
          item.marka &&
          item.marka.toLowerCase().includes(machineFilter.marka.toLowerCase())
      );
    }
    if (machineFilter.otkuda) {
      filtered = filtered.filter(
        (item) =>
          item.otkuda &&
          item.otkuda.toLowerCase().includes(machineFilter.otkuda.toLowerCase())
      );
    }
    if (machineFilter.kuda) {
      filtered = filtered.filter(
        (item) =>
          item.kuda &&
          item.kuda.toLowerCase().includes(machineFilter.kuda.toLowerCase())
      );
    }
  }

  return (
    <div className={s.parserContainer}>
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
              onClick={() => {
                setCurrentType("CargoOrder");
                setCargoFilter({ cargo: "", from: "", to: "" });
              }}
            >
              Грузы
            </button>
            <button
              className={
                currentType === "MachineOrder" ? s.activeText : s.switcher
              }
              onClick={() => {
                setCurrentType("MachineOrder");
                setMachineFilter({ marka: "", otkuda: "", kuda: "" });
              }}
            >
              Машины
            </button>
          </div>
        </div>
      </div>

      {/* Расширенные фильтры */}
      <div className={s.filters}>
        {currentType === "CargoOrder" ? (
          <div className={s.filterGroup}>
            <input
              type="text"
              placeholder="Поиск по грузу"
              value={cargoFilter.cargo}
              onChange={(e) =>
                setCargoFilter({ ...cargoFilter, cargo: e.target.value })
              }
              className={s.filterInput}
            />
            <input
              type="text"
              placeholder="Откуда"
              value={cargoFilter.from}
              onChange={(e) =>
                setCargoFilter({ ...cargoFilter, from: e.target.value })
              }
              className={s.filterInput}
            />
            <input
              type="text"
              placeholder="Куда"
              value={cargoFilter.to}
              onChange={(e) =>
                setCargoFilter({ ...cargoFilter, to: e.target.value })
              }
              className={s.filterInput}
            />
          </div>
        ) : (
          <div className={s.filterGroup}>
            <input
              type="text"
              placeholder="Поиск по марке"
              value={machineFilter.marka}
              onChange={(e) =>
                setMachineFilter({ ...machineFilter, marka: e.target.value })
              }
              className={s.filterInput}
            />
            <input
              type="text"
              placeholder="Откуда"
              value={machineFilter.otkuda}
              onChange={(e) =>
                setMachineFilter({ ...machineFilter, otkuda: e.target.value })
              }
              className={s.filterInput}
            />
            <input
              type="text"
              placeholder="Куда"
              value={machineFilter.kuda}
              onChange={(e) =>
                setMachineFilter({ ...machineFilter, kuda: e.target.value })
              }
              className={s.filterInput}
            />
          </div>
        )}
      </div>

      <div className={s.resultContainer}>
        <div className={s.cardsGrid}>
          {filtered.length > 0 ? (
            filtered.map((item, index) => <Card key={index} data={item} />)
          ) : (
            <p className={s.placeholder}>Нет заявок по выбранному типу</p>
          )}
        </div>
      </div>
    </div>
  );
};
