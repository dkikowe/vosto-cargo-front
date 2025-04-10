import React, { useState, useEffect, useContext } from "react";
import s from "../Main.module.sass";
import axios from "../../../axios";
import ReactPullToRefresh from "react-simple-pull-to-refresh";
// Импортируем наш контекст темы
import { ThemeContext } from "../../../context/ThemeContext";
import { Star, StarOff } from "lucide-react";

// ---------- Парсинг дат (не меняем) ----------
function tryParseDate(ddmm, yearArg) {
  if (!ddmm) return null;
  const [dd, mm] = ddmm.split(".");
  if (!dd || !mm) return null;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  if (isNaN(day) || isNaN(month) || month < 1 || month > 12) {
    return null;
  }
  const year = yearArg || new Date().getFullYear();
  return new Date(year, month - 1, day);
}

function parseRange(readyStr, yearArg) {
  if (!readyStr || typeof readyStr !== "string") {
    return [null, null];
  }
  const rangeStr = readyStr.replace(/[—–-]/g, "–").trim();
  const parts = rangeStr.split("–").map((p) => p.trim());
  if (parts.length === 1) {
    const singleDate = tryParseDate(parts[0], yearArg);
    if (!singleDate) return [null, null];
    const start = new Date(singleDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(singleDate);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  if (parts.length >= 2) {
    const d1 = tryParseDate(parts[0], yearArg);
    const d2 = tryParseDate(parts[1], yearArg);
    if (!d1 && !d2) return [null, null];
    let start = d1 ? new Date(d1) : null;
    if (start) start.setHours(0, 0, 0, 0);
    let end = d2 ? new Date(d2) : null;
    if (end) end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  return [null, null];
}

// ---------- Компонент карточки (не меняем) ----------

// ---------- Компонент карточки (с добавлением рейтинга) ----------
export const Card = ({ data }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const [mapLink, setMapLink] = useState(null);
  const [showContact, setShowContact] = useState(false);

  // Новые стейты для рейтинга
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingValue, setRatingValue] = useState("");
  const [ratingReason, setRatingReason] = useState("");

  const isCargo = data.orderType === "CargoOrder";

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= ratingValue;
      stars.push(
        <span
          key={i}
          onClick={() => setRatingValue(i)}
          onMouseEnter={() => setRatingValue(i)}
          style={{
            cursor: "pointer",
            transition: "color 0.2s",
            color: isDark
              ? isActive
                ? "#facc15"
                : "#555"
              : isActive
              ? "#facc15"
              : "#ccc",
          }}
        >
          {isActive ? <Star size={24} /> : <StarOff size={24} />}
        </span>
      );
    }
    return stars;
  };

  const cardStyle = {
    backgroundColor: isDark ? "#111" : "#fff",
    color: isDark ? "#fff" : "#000",
  };

  useEffect(() => {
    const fetchMapLink = async () => {
      if (data.from && data.to) {
        try {
          const response = await axios.get("/api/distance", {
            params: {
              cityA: data.from,
              cityB: data.to,
            },
          });
          setMapLink(response.data.routeUrl);
        } catch (error) {
          console.error("Ошибка при получении маршрута:", error);
        }
      }
    };

    if (isCargo) {
      fetchMapLink();
    }
  }, [data.from, data.to]);

  // Показать контакт
  const handleShowContact = () => setShowContact(true);

  // Показать форму рейтинга
  const handleShowRatingForm = () => {
    setShowRatingForm(true);
  };

  // Отправка рейтинга
  const handleSubmitRating = async () => {
    try {
      await axios.post(`/api/rating/rate/${data.createdBy}`, {
        rating: Number(ratingValue),
        reason: ratingReason,
      });

      alert("Рейтинг успешно установлен!");
      setShowRatingForm(false);
      // при необходимости сбросить поля формы:
      // setRatingValue("");
      // setRatingReason("");
    } catch (error) {
      console.error("Ошибка при выставлении рейтинга:", error);
      alert("Не удалось отправить рейтинг. Попробуйте снова.");
    }
  };

  // Вёрстка для грузов
  if (isCargo) {
    return (
      <div className={s.card} style={cardStyle}>
        <div className={s.cardHeader}>
          {data.orderNumber && <h3>Груз номер: Nº{data.orderNumber}</h3>}
          {data.cargo && <h3>{data.cargo}</h3>}
          {data.ready && <p>{data.ready}</p>}
        </div>
        {(data.from || data.to) && (
          <div className={s.cardRoute}>
            {data.from && (
              <div>
                <span className={s.label} style={cardStyle}>
                  Откуда:
                </span>
                <p>{data.from}</p>
              </div>
            )}
            {data.to && (
              <div>
                <span className={s.label} style={cardStyle}>
                  Куда:
                </span>
                <p>{data.to}</p>
              </div>
            )}
            {mapLink && (
              <a
                className={s.routeButton}
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Показать маршрут на карте
              </a>
            )}
          </div>
        )}
        <div className={s.cardBody}>
          {data.weight && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Вес:
              </span>
              <span>{data.weight}</span>
            </div>
          )}
          {data.volume && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Объём:
              </span>
              <span>{data.volume}</span>
            </div>
          )}
          {data.rate && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Ставка:
              </span>
              <span>{data.rate}</span>
            </div>
          )}
          {data.vehicle && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Тип ТС:
              </span>
              <span>{data.vehicle}</span>
            </div>
          )}

          {data.telefon && (
            <div className={s.cardContact}>
              {!showContact ? (
                <button className={s.contactButton} onClick={handleShowContact}>
                  Связаться с заказчиком
                </button>
              ) : (
                <div>
                  <span className={s.label} style={cardStyle}>
                    Контакт:
                  </span>
                  <p>Тел: {data.telefon}</p>

                  {/* Если у заявки есть createdBy, показываем кнопку рейтинга */}
                  {data.createdBy && !showRatingForm && (
                    <button
                      className={s.contactButton}
                      onClick={handleShowRatingForm}
                    >
                      Оставить рейтинг
                    </button>
                  )}

                  {/* Форма рейтинга */}
                  {showRatingForm && (
                    <div className={s.ratingForm}>
                      <label style={cardStyle}>
                        Рейтинг:
                        <div
                          style={{
                            display: "flex",
                            gap: "0.4rem",
                            marginTop: "0.3rem",
                          }}
                        >
                          {renderStars()}
                        </div>
                      </label>

                      <label style={cardStyle}>
                        Причина/Комментарий:
                        <textarea
                          rows={3}
                          value={ratingReason}
                          onChange={(e) => setRatingReason(e.target.value)}
                        />
                      </label>
                      <button onClick={handleSubmitRating}>Сохранить</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Вёрстка для машин
  else {
    return (
      <div className={s.card} style={cardStyle}>
        <div className={s.cardHeader}>
          {data.orderNumber && <h3>Груз номер: Nº{data.orderNumber}</h3>}
          {(data.marka || data.tip) && (
            <h3>
              {data.marka} {data.tip}
            </h3>
          )}
          {data.data_gotovnosti && (
            <span className={s.date}>{data.data_gotovnosti}</span>
          )}
        </div>
        <div className={s.cardBody}>
          {data.kuzov && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Кузов:
              </span>
              <span>{data.kuzov}</span>
            </div>
          )}
          {data.tip_zagruzki && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Тип загрузки:
              </span>
              <span>{data.tip_zagruzki}</span>
            </div>
          )}
          {data.gruzopodyomnost && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Грузоподъемность:
              </span>
              <span>{data.gruzopodyomnost}</span>
            </div>
          )}
          {data.vmestimost && (
            <div className={s.cardRow}>
              <span className={s.label} style={cardStyle}>
                Вместимость:
              </span>
              <span>{data.vmestimost}</span>
            </div>
          )}
          {(data.otkuda || data.kuda) && (
            <div className={s.cardRoute}>
              {data.otkuda && (
                <div>
                  <span className={s.label} style={cardStyle}>
                    Откуда:
                  </span>
                  <p>{data.otkuda}</p>
                </div>
              )}
              {data.kuda && (
                <div>
                  <span className={s.label} style={cardStyle}>
                    Куда:
                  </span>
                  <p>{data.kuda}</p>
                </div>
              )}
            </div>
          )}

          {(data.imya || data.firma || data.telefon) && (
            <div className={s.cardContact}>
              {!showContact ? (
                <button className={s.contactButton} onClick={handleShowContact}>
                  Связаться с перевозчиком
                </button>
              ) : (
                <div>
                  <span className={s.label} style={cardStyle}>
                    Контакт:
                  </span>
                  {data.imya && <p>{data.imya}</p>}
                  {data.firma && <p>({data.firma})</p>}
                  {data.telefon && <p>Тел: {data.telefon}</p>}

                  {/* Если у заявки есть createdBy, показываем кнопку рейтинга */}
                  {data.createdBy && !showRatingForm && (
                    <button
                      className={s.contactButton}
                      onClick={handleShowRatingForm}
                    >
                      Оставить рейтинг
                    </button>
                  )}

                  {/* Форма рейтинга */}
                  {showRatingForm && (
                    <div className={s.ratingForm}>
                      <label style={cardStyle}>
                        Рейтинг:
                        <div
                          style={{
                            display: "flex",
                            gap: "0.4rem",
                            marginTop: "0.3rem",
                          }}
                        >
                          {renderStars()}
                        </div>
                      </label>

                      <label style={cardStyle}>
                        Причина/Комментарий:
                        <textarea
                          rows={3}
                          value={ratingReason}
                          onChange={(e) => setRatingReason(e.target.value)}
                        />
                      </label>
                      <button onClick={handleSubmitRating}>Сохранить</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

// ---------- Основной компонент ----------
export const ParserSwitcher = () => {
  // Забираем тему из контекста
  const { theme } = useContext(ThemeContext);

  const [currentType, setCurrentType] = useState("CargoOrder");
  const [currentTab, setCurrentTab] = useState("feed");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Поля поиска
  const [cargoSearch, setCargoSearch] = useState({
    fromDate: "",
    toDate: "",
    cargoType: "",
    fromLocation: "",
    toLocation: "",
  });
  const [machineSearch, setMachineSearch] = useState({
    fromDate: "",
    toDate: "",
    tonnage: "",
    fromLocation: "",
    toLocation: "",
    bodyType: "",
  });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/allOrders");
      setResult(data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCargo = () => {
    setCargoSearch({
      fromDate: "",
      toDate: "",
      cargoType: "",
      fromLocation: "",
      toLocation: "",
    });
    setSearchResults([]);
  };

  const handleResetMachine = () => {
    setMachineSearch({
      fromDate: "",
      toDate: "",
      tonnage: "",
      fromLocation: "",
      toLocation: "",
      bodyType: "",
    });
    setSearchResults([]);
  };

  const handleSearchCargo = () => {
    if (!result) return;
    let filtered = result.filter(
      (item) => item.orderType === "CargoOrder" && !item.isArchived
    );
    if (cargoSearch.fromDate || cargoSearch.toDate) {
      let fromD = cargoSearch.fromDate ? new Date(cargoSearch.fromDate) : null;
      if (fromD) fromD.setHours(0, 0, 0, 0);
      let toD = cargoSearch.toDate ? new Date(cargoSearch.toDate) : null;
      if (toD) toD.setHours(23, 59, 59, 999);
      const usedYear =
        fromD?.getFullYear() || toD?.getFullYear() || new Date().getFullYear();
      filtered = filtered.filter((item) => {
        const [startDate, endDate] = parseRange(item.ready, usedYear);
        if (!startDate || !endDate) return false;
        if (fromD && startDate < fromD) return false;
        if (toD && endDate > toD) return false;
        return true;
      });
    }
    if (cargoSearch.cargoType) {
      filtered = filtered.filter((item) => {
        if (!item.cargo) return false;
        return item.cargo
          .toLowerCase()
          .includes(cargoSearch.cargoType.toLowerCase());
      });
    }
    if (cargoSearch.fromLocation) {
      filtered = filtered.filter((item) => {
        if (!item.from) return false;
        return item.from
          .toLowerCase()
          .includes(cargoSearch.fromLocation.toLowerCase());
      });
    }
    if (cargoSearch.toLocation) {
      filtered = filtered.filter((item) => {
        if (!item.to) return false;
        return item.to
          .toLowerCase()
          .includes(cargoSearch.toLocation.toLowerCase());
      });
    }
    setSearchResults(filtered);
  };

  const handleSearchMachine = () => {
    if (!result) return;
    let filtered = result.filter(
      (item) => item.orderType === "MachineOrder" && !item.isArchived
    );
    if (machineSearch.fromDate || machineSearch.toDate) {
      let fromD = machineSearch.fromDate
        ? new Date(machineSearch.fromDate)
        : null;
      if (fromD) fromD.setHours(0, 0, 0, 0);
      let toD = machineSearch.toDate ? new Date(machineSearch.toDate) : null;
      if (toD) toD.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        if (!item.data_gotovnosti) return false;
        let itemDate;
        const ddmmParsed = tryParseDate(item.data_gotovnosti);
        if (ddmmParsed) {
          itemDate = ddmmParsed;
        } else {
          itemDate = new Date(item.data_gotovnosti);
        }
        if (isNaN(itemDate.getTime())) return false;
        if (fromD && itemDate < fromD) return false;
        if (toD && itemDate > toD) return false;
        return true;
      });
    }
    if (machineSearch.tonnage) {
      filtered = filtered.filter((item) => {
        if (!item.gruzopodyomnost) return false;
        return item.gruzopodyomnost
          .toLowerCase()
          .includes(machineSearch.tonnage.toLowerCase());
      });
    }
    if (machineSearch.fromLocation) {
      filtered = filtered.filter((item) => {
        if (!item.otkuda) return false;
        return item.otkuda
          .toLowerCase()
          .includes(machineSearch.fromLocation.toLowerCase());
      });
    }
    if (machineSearch.toLocation) {
      filtered = filtered.filter((item) => {
        if (!item.kuda) return false;
        return item.kuda
          .toLowerCase()
          .includes(machineSearch.toLocation.toLowerCase());
      });
    }
    if (machineSearch.bodyType) {
      filtered = filtered.filter((item) => {
        if (!item.kuzov) return false;
        return item.kuzov
          .toLowerCase()
          .includes(machineSearch.bodyType.toLowerCase());
      });
    }
    setSearchResults(filtered);
  };

  const handleTypeSwitch = (type) => {
    setCurrentType(type);
    setCurrentTab("feed");
    setCargoSearch({
      fromDate: "",
      toDate: "",
      cargoType: "",
      fromLocation: "",
      toLocation: "",
    });
    setMachineSearch({
      fromDate: "",
      toDate: "",
      tonnage: "",
      fromLocation: "",
      toLocation: "",
      bodyType: "",
    });
    setSearchResults([]);
  };

  // Формируем список для «Ленты»
  const feedData = result
    ? result
        .filter((item) => item.orderType === currentType && !item.isArchived)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  // Если идёт загрузка
  if (isLoading) {
    return (
      <div className={s.loading}>
        <div
          className={s.header}
          style={{
            backgroundColor: theme === "dark" ? "#121212" : "",
          }}
        >
          <div className={s.switch}>
            <div className={s.typeSwitcher}>
              <div
                className={s.switchIndicator}
                style={{
                  left: currentType === "CargoOrder" ? "0%" : "50%",
                }}
              />
              <button
                className={
                  currentType === "CargoOrder" ? s.activeText : s.switcher
                }
                onClick={() => handleTypeSwitch("CargoOrder")}
              >
                Грузы
              </button>
              <button
                className={
                  currentType === "MachineOrder" ? s.activeText : s.switcher
                }
                onClick={() => handleTypeSwitch("MachineOrder")}
              >
                Машины
              </button>
            </div>
          </div>
          <div className={s.statusButtons}>
            <button
              className={currentTab === "feed" ? s.statusActive : s.statusItem}
              onClick={() => setCurrentTab("feed")}
            >
              Лента
            </button>
            <button
              className={
                currentTab === "search" ? s.statusActiveArchive : s.archive
              }
              onClick={() => {
                setCurrentTab("search");
                setSearchResults([]);
              }}
            >
              Поиск
            </button>
          </div>
        </div>
        Загрузка...
      </div>
    );
  }

  // Если данных нет
  if (!result) {
    return <div className={s.placeholder}>Нет данных</div>;
  }

  // ---------------------------------------------------------
  // Тут мы будем применять стили для dark/light:
  // Можно добавить класс s.darkTheme, s.lightTheme, или inline-стили
  // ---------------------------------------------------------
  const containerStyle = {
    backgroundColor: theme === "dark" ? "#1A1A1A" : undefined,
    color: theme === "dark" ? "#ddd" : undefined,
    minHeight: "100vh", // чтобы фон точно покрывал экран
  };

  return (
    <div className={s.parserContainer} style={containerStyle}>
      <div
        className={s.header}
        style={{
          backgroundColor: theme === "dark" ? "#121212" : "",
        }}
      >
        <div className={s.switch}>
          <div className={s.typeSwitcher}>
            <div
              className={s.switchIndicator}
              style={{
                left: currentType === "CargoOrder" ? "0%" : "50%",
              }}
            />
            <button
              className={
                currentType === "CargoOrder" ? s.activeText : s.switcher
              }
              onClick={() => handleTypeSwitch("CargoOrder")}
            >
              Грузы
            </button>
            <button
              className={
                currentType === "MachineOrder" ? s.activeText : s.switcher
              }
              onClick={() => handleTypeSwitch("MachineOrder")}
            >
              Машины
            </button>
          </div>
        </div>
        <div className={s.statusButtons}>
          <button
            className={currentTab === "feed" ? s.statusActive : s.statusItem}
            onClick={() => setCurrentTab("feed")}
          >
            Лента
          </button>
          <button
            className={
              currentTab === "search" ? s.statusActiveArchive : s.archive
            }
            onClick={() => {
              setCurrentTab("search");
              setSearchResults([]);
            }}
          >
            Поиск
          </button>
        </div>
      </div>

      {/* Вкладка ЛЕНТА – Pull to Refresh */}
      {currentTab === "feed" && (
        <ReactPullToRefresh
          onRefresh={fetchData}
          pullingContent={<div className={s.loading}>Потяните вниз</div>}
          refreshingContent={<div className={s.loading}>Обновляем...</div>}
          resistance={2.5}
        >
          <div
            className={s.resultContainer}
            style={{
              overflowY: "auto",
              backgroundColor: theme === "dark" ? "#000" : "#fff",
            }}
          >
            <div className={s.cardsGrid}>
              {feedData.length > 0 ? (
                feedData.map((item, index) => <Card key={index} data={item} />)
              ) : (
                <p className={s.placeholder}>Нет заявок по выбранному типу</p>
              )}
            </div>
          </div>
        </ReactPullToRefresh>
      )}

      {/* Вкладка ПОИСК */}
      {currentTab === "search" && (
        <div className={s.searchContainer}>
          {currentType === "CargoOrder" ? (
            <div className={s.filterContainer}>
              <div className={s.filterGroup}>
                <label className={s.filterLabel}>
                  Дата (с):
                  <input
                    type="date"
                    value={cargoSearch.fromDate}
                    onChange={(e) =>
                      setCargoSearch({
                        ...cargoSearch,
                        fromDate: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Дата (по):
                  <input
                    type="date"
                    value={cargoSearch.toDate}
                    onChange={(e) =>
                      setCargoSearch({
                        ...cargoSearch,
                        toDate: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Тип груза:
                  <input
                    type="text"
                    placeholder="Напр.: песок, мебель..."
                    value={cargoSearch.cargoType}
                    onChange={(e) =>
                      setCargoSearch({
                        ...cargoSearch,
                        cargoType: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Откуда:
                  <input
                    type="text"
                    placeholder="Город отправления"
                    value={cargoSearch.fromLocation}
                    onChange={(e) =>
                      setCargoSearch({
                        ...cargoSearch,
                        fromLocation: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Куда:
                  <input
                    type="text"
                    placeholder="Город доставки"
                    value={cargoSearch.toLocation}
                    onChange={(e) =>
                      setCargoSearch({
                        ...cargoSearch,
                        toLocation: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
              </div>
              <div className={s.buttonGroup}>
                <button className={s.searchButton} onClick={handleSearchCargo}>
                  Найти
                </button>
                <button className={s.reset} onClick={handleResetCargo}>
                  Сброс
                </button>
              </div>
            </div>
          ) : (
            <div className={s.filterContainer}>
              <div className={s.filterGroup}>
                <label className={s.filterLabel}>
                  Дата готовности:
                  <input
                    type="date"
                    value={machineSearch.fromDate}
                    onChange={(e) =>
                      setMachineSearch({
                        ...machineSearch,
                        fromDate: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Тоннаж:
                  <input
                    type="text"
                    placeholder="Напр.: 5 т, 20 т..."
                    value={machineSearch.tonnage}
                    onChange={(e) =>
                      setMachineSearch({
                        ...machineSearch,
                        tonnage: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Откуда:
                  <input
                    type="text"
                    placeholder="Место отправления"
                    value={machineSearch.fromLocation}
                    onChange={(e) =>
                      setMachineSearch({
                        ...machineSearch,
                        fromLocation: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Куда:
                  <input
                    type="text"
                    placeholder="Место назначения"
                    value={machineSearch.toLocation}
                    onChange={(e) =>
                      setMachineSearch({
                        ...machineSearch,
                        toLocation: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
                <label className={s.filterLabel}>
                  Тип кузова:
                  <input
                    type="text"
                    placeholder="Напр.: тент, изотерм..."
                    value={machineSearch.bodyType}
                    onChange={(e) =>
                      setMachineSearch({
                        ...machineSearch,
                        bodyType: e.target.value,
                      })
                    }
                    className={s.filterInput}
                  />
                </label>
              </div>
              <div className={s.buttonGroup}>
                <button
                  className={s.searchButton}
                  onClick={handleSearchMachine}
                >
                  Найти
                </button>
                <button className={s.reset} onClick={handleResetMachine}>
                  Сброс
                </button>
              </div>
            </div>
          )}
          {searchResults.length > 0 ? (
            <div className={s.cardsGrid}>
              {searchResults.map((item, index) => (
                <Card key={index} data={item} />
              ))}
            </div>
          ) : (
            searchResults.length === 0 && (
              <p className={s.placeholder}>Нет заявок по заданным фильтрам</p>
            )
          )}
        </div>
      )}
    </div>
  );
};
