import React, { useState, useEffect, useRef } from "react";
import s from "../Main.module.sass";
import axios from "../../../axios";

// ---------- Утилиты парсинга ----------
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

// ---------- Компонент карточки ----------
export const Card = ({ data }) => {
  const isCargo = data.orderType === "CargoOrder";
  if (isCargo) {
    return (
      <div className={s.card}>
        <div className={s.cardHeader}>
          {data.cargo && <h3>{data.cargo}</h3>}
          {data.ready && <span className={s.date}>{data.ready}</span>}
        </div>
        <div className={s.cardBody}>
          {data.weight && (
            <div className={s.cardRow}>
              <span className={s.label}>Вес:</span>
              <span>{data.weight}</span>
            </div>
          )}
          {data.volume && (
            <div className={s.cardRow}>
              <span className={s.label}>Объём:</span>
              <span>{data.volume}</span>
            </div>
          )}
          {data.rate && (
            <div className={s.cardRow}>
              <span className={s.label}>Ставка:</span>
              <span>{data.rate}</span>
            </div>
          )}
          {data.vehicle && (
            <div className={s.cardRow}>
              <span className={s.label}>Тип ТС:</span>
              <span>{data.vehicle}</span>
            </div>
          )}
          {(data.from || data.to) && (
            <div className={s.cardRoute}>
              {data.from && (
                <div>
                  <span className={s.label}>Откуда:</span>
                  <p>{data.from}</p>
                </div>
              )}
              {data.to && (
                <div>
                  <span className={s.label}>Куда:</span>
                  <p>{data.to}</p>
                </div>
              )}
            </div>
          )}
          {data.telefon && (
            <div className={s.cardContact}>
              <div>
                <span className={s.label}>Контакт:</span>
                <p>Тел: {data.telefon}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className={s.card}>
        <div className={s.cardHeader}>
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
              <span className={s.label}>Кузов:</span>
              <span>{data.kuzov}</span>
            </div>
          )}
          {data.tip_zagruzki && (
            <div className={s.cardRow}>
              <span className={s.label}>Тип загрузки:</span>
              <span>{data.tip_zagruzki}</span>
            </div>
          )}
          {data.gruzopodyomnost && (
            <div className={s.cardRow}>
              <span className={s.label}>Грузоподъемность:</span>
              <span>{data.gruzopodyomnost}</span>
            </div>
          )}
          {data.vmestimost && (
            <div className={s.cardRow}>
              <span className={s.label}>Вместимость:</span>
              <span>{data.vmestimost}</span>
            </div>
          )}
          {(data.otkuda || data.kuda) && (
            <div className={s.cardRoute}>
              {data.otkuda && (
                <div>
                  <span className={s.label}>Откуда:</span>
                  <p>{data.otkuda}</p>
                </div>
              )}
              {data.kuda && (
                <div>
                  <span className={s.label}>Куда:</span>
                  <p>{data.kuda}</p>
                </div>
              )}
            </div>
          )}
          {(data.imya || data.firma || data.telefon) && (
            <div className={s.cardContact}>
              <div>
                <span className={s.label}>Контакт:</span>
                {data.imya && <p>{data.imya}</p>}
                {data.firma && <p>({data.firma})</p>}
                {data.telefon && <p>Тел: {data.telefon}</p>}
              </div>
            </div>
          )}
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

// ---------- Основной компонент ----------
export const ParserSwitcher = ({ theme }) => {
  const [currentType, setCurrentType] = useState("CargoOrder");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTab, setCurrentTab] = useState("feed");

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

  // Поля для pull-to-refresh
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    // Допустим, при каждом заходе на вкладку "feed"
    if (currentTab === "feed") {
      setPullDistance(0);
      setPullStartY(0);
      // при необходимости - scrollTop = 0
      if (feedRef.current) {
        feedRef.current.scrollTop = 0;
      }
    }
  }, [currentTab]);

  // Загрузка данных при первом рендере
  useEffect(() => {
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
    handleParse();
  }, []);

  // Добавляем обработчики touch-событий для pull-to-refresh
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    function onTouchStart(e) {
      // Сбрасываем состояние
      setPullDistance(0);
      setPullStartY(0);

      // Проверяем, действительно ли мы на самом верху
      if (el.scrollTop <= 0) {
        setPullStartY(e.touches[0].clientY);
      }
    }

    function onTouchMove(e) {
      // Если pullStartY == 0, значит жест не начался с самого верха
      if (pullStartY === 0) return;

      // Текущее смещение
      const dist = e.touches[0].clientY - pullStartY;

      // Если пользователь тянет вниз
      if (dist > 0) {
        // Блокируем дефолтный скролл, чтобы не "соскальзывать"
        e.preventDefault();
        setPullDistance(dist);
      } else {
        // Если потянули в обратную сторону, сбрасываем
        setPullDistance(0);
      }
    }

    function onTouchEnd() {
      if (pullDistance > 5) {
        setIsRefreshing(true);
        handleRefresh().then(() => {
          setIsRefreshing(false);
        });
      }
      setPullDistance(0);
      setPullStartY(0);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullStartY, pullDistance]);

  // Перезапрашивает данные
  const fetchData = async () => {
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

  const handleRefresh = async () => {
    await fetchData();
    // Можно вернуть Promise.resolve(), если где-то требуется then
    return Promise.resolve();
  };

  // Сброс полей поиска
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

  // Если идёт загрузка
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
                style={{
                  left: currentType === "CargoOrder" ? "0%" : "50%",
                }}
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
        <div className={s.loading}>Загрузка...</div>
      </>
    );
  }

  // Если данные не пришли
  if (!result) {
    return <div className={s.placeholder}>Нет данных для отображения</div>;
  }

  // Фильтрация по ленте
  const feedData = result
    .filter((item) => item.orderType === currentType && !item.isArchived)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Обработка поиска (грузы)
  const handleSearchCargo = () => {
    let filtered = result.filter(
      (item) => item.orderType === "CargoOrder" && !item.isArchived
    );
    // Дата
    if (cargoSearch.fromDate || cargoSearch.toDate) {
      let fromD = null;
      if (cargoSearch.fromDate) {
        fromD = new Date(cargoSearch.fromDate);
        fromD.setHours(0, 0, 0, 0);
      }
      let toD = null;
      if (cargoSearch.toDate) {
        toD = new Date(cargoSearch.toDate);
        toD.setHours(23, 59, 59, 999);
      }
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
    // Тип груза
    if (cargoSearch.cargoType) {
      filtered = filtered.filter((item) => {
        if (!item.cargo) return false;
        return item.cargo
          .toLowerCase()
          .includes(cargoSearch.cargoType.toLowerCase());
      });
    }
    // Откуда
    if (cargoSearch.fromLocation) {
      filtered = filtered.filter((item) => {
        if (!item.from) return false;
        return item.from
          .toLowerCase()
          .includes(cargoSearch.fromLocation.toLowerCase());
      });
    }
    // Куда
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

  // Обработка поиска (машины)
  const handleSearchMachine = () => {
    let filtered = result.filter(
      (item) => item.orderType === "MachineOrder" && !item.isArchived
    );
    // Даты
    if (machineSearch.fromDate || machineSearch.toDate) {
      let fromD = null;
      if (machineSearch.fromDate) {
        fromD = new Date(machineSearch.fromDate);
        fromD.setHours(0, 0, 0, 0);
      }
      let toD = null;
      if (machineSearch.toDate) {
        toD = new Date(machineSearch.toDate);
        toD.setHours(23, 59, 59, 999);
      }
      filtered = filtered.filter((item) => {
        if (!item.data_gotovnosti) return false;
        let itemDate;
        const ddmmParsed = tryParseDate(item.data_gotovnosti);
        if (ddmmParsed) {
          itemDate = ddmmParsed;
        } else {
          itemDate = new Date(item.data_gotovnosti);
        }
        if (isNaN(itemDate.getTime())) {
          return false;
        }
        if (fromD && itemDate < fromD) return false;
        if (toD && itemDate > toD) return false;
        return true;
      });
    }
    // Тоннаж
    if (machineSearch.tonnage) {
      filtered = filtered.filter((item) => {
        if (!item.gruzopodyomnost) return false;
        return item.gruzopodyomnost
          .toLowerCase()
          .includes(machineSearch.tonnage.toLowerCase());
      });
    }
    // Откуда
    if (machineSearch.fromLocation) {
      filtered = filtered.filter((item) => {
        if (!item.otkuda) return false;
        return item.otkuda
          .toLowerCase()
          .includes(machineSearch.fromLocation.toLowerCase());
      });
    }
    // Куда
    if (machineSearch.toLocation) {
      filtered = filtered.filter((item) => {
        if (!item.kuda) return false;
        return item.kuda
          .toLowerCase()
          .includes(machineSearch.toLocation.toLowerCase());
      });
    }
    // Тип кузова
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

  // Смена вкладки «Грузы / Машины»
  const handleTypeSwitch = (type) => {
    setCurrentType(type);
    setCurrentTab("feed");
    // Сброс полей поиска и результатов
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

      {/* Вкладка «Лента» */}
      {currentTab === "feed" && (
        <div
          className={s.resultContainer}
          ref={feedRef}
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Блок индикатора pull-to-refresh */}
          <div
            className={s.pullIndicator}
            style={{
              height: isRefreshing ? 50 : pullDistance,
              transition: isRefreshing ? "height 0.2s" : "none",
            }}
          >
            {isRefreshing ? (
              <div className={s.loadingR}>Обновление...</div>
            ) : (
              pullDistance > 0 && <div className={s.custom_spinner} />
            )}
          </div>

          {/* Список карточек */}
          <div className={s.cardsGrid}>
            {feedData.length > 0 ? (
              feedData.map((item, index) => <Card key={index} data={item} />)
            ) : (
              <p className={s.placeholder}>Нет заявок по выбранному типу</p>
            )}
          </div>
        </div>
      )}

      {/* Вкладка «Поиск» */}
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
