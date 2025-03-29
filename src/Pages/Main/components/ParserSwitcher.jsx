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

  const handleParse = async (type) => {
    setIsLoading(true);
    try {
      const endpoint =
        type === "CargoOrder" ? "/parse-cargo" : "/parse-vehicles";
      const { data } = await axios.get(endpoint);
      setResult(data.data);
    } catch (error) {
      console.error("Ошибка при парсинге:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // При загрузке страницы сразу грузим "Грузы"
    handleParse("CargoOrder");
  }, []);

  const typeIndicatorLeft = currentType === "CargoOrder" ? "0%" : "50%";

  // Лоадер / Плейсхолдер
  if (isLoading) {
    return (
      <>
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
                onClick={() => {
                  setCurrentType("CargoOrder");
                  handleParse("CargoOrder");
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
                  handleParse("MachineOrder");
                }}
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
    return (
      <div className={s.placeholder}>Выберите тип данных для парсинга</div>
    );
  }

  return (
    <div className={s.parserContainer}>
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
              onClick={() => {
                setCurrentType("CargoOrder");
                handleParse("CargoOrder");
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
                handleParse("MachineOrder");
              }}
            >
              Машины
            </button>
          </div>
        </div>
      </div>

      <div className={s.resultContainer}>
        <div className={s.cardsGrid}>
          {result.map((item, index) => (
            <Card key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
