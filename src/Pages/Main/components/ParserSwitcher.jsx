import React, { useState, useEffect, useContext } from "react";
import s from "../Main.module.sass";
import axios from "../../../axios";
import ReactPullToRefresh from "react-simple-pull-to-refresh";
// Импортируем наш контекст темы
import { ThemeContext } from "../../../context/ThemeContext";
import { Star, StarOff } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [mapLink, setMapLink] = useState(null);
  const [showContact, setShowContact] = useState(false);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingValue, setRatingValue] = useState("");
  const [ratingReason, setRatingReason] = useState("");

  const isCargo = data.orderType === "CargoOrder";
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(null);

  // --- добавлено для раскрытия деталей ---
  const [showDetails, setShowDetails] = useState(false);

  const cardStyle = {
    // backgroundColor: isDark ? "#fff" : "#fff",
    // color: isDark ? "#000" : "#000",
    // borderRadius: 16,
    // boxShadow: "0px 0px 55px rgba(37, 52, 73, 0.05)",
    // marginBottom: 16,
    // padding: 0,
    // border: "none"
  };

  useEffect(() => {
    const localId = localStorage.getItem("id");
    setCurrentUserId(localId);

    if (data.createdBy && localId) {
      axios.get(`/getUserById/${data.createdBy}`).then((res) => {
        const history = res.data?.ratingHistory || [];
        const found = history.find((r) => r.fromUser === localId);

        if (found) {
          setHasRated(true);
          setUserRating(found);
        }
      });
    }
  }, [data.createdBy]);

  useEffect(() => {
    const fetchMapLink = async () => {
      if (data.from && data.to) {
        try {
          const response = await axios.get("/api/distance", {
            params: { cityA: data.from, cityB: data.to },
          });
          setMapLink(response.data.routeUrl);
        } catch (error) {
          console.error(t("card.errorFetchingRoute"), error);
        }
      }
    };
    if (isCargo) fetchMapLink();
  }, [data.from, data.to]);

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

  const handleShowContact = () => setShowContact(true);
  const handleShowRatingForm = () => setShowRatingForm(true);

  const handleSubmitRating = async () => {
    try {
      await axios.post(`/api/rating/rate/${data.createdBy}`, {
        rating: Number(ratingValue),
        reason: ratingReason,
        fromUserId: currentUserId,
      });
      alert(t("card.ratingSuccess"));
      setShowRatingForm(false);
    } catch (error) {
      console.error(t("card.ratingError"), error);
      alert(t("card.ratingError"));
    }
  };

  const renderRatingSection = () => (
    <>
      {data.createdBy &&
        (hasRated ? (
          <div className={s.rated} style={{ marginTop: "0.5rem" }}>
            <p style={{ fontWeight: "bold" }}>{t("card.yourReview")}</p>
            <p className={s.ratedStars}>
              {[...Array(userRating?.value)].map((_, i) => (
                <Star key={i} size={18} color="#facc15" />
              ))}
            </p>
            <p style={{ fontStyle: "italic" }}>
              {userRating?.reason || t("card.noComment")}
            </p>
          </div>
        ) : (
          !showRatingForm && (
            <button className={s.contactButton} onClick={handleShowRatingForm}>
              {t("card.leaveRating")}
            </button>
          )
        ))}
      {showRatingForm && (
        <div className={s.ratingForm}>
          <label style={cardStyle}>
            {t("card.rating")}
            <div
              style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}
            >
              {renderStars()}
            </div>
          </label>
          <label style={cardStyle}>
            {t("card.reason")}
            <textarea
              rows={3}
              value={ratingReason}
              onChange={(e) => setRatingReason(e.target.value)}
            />
          </label>
          <button onClick={handleSubmitRating}>{t("card.save")}</button>
        </div>
      )}
    </>
  );

  // -------------------- CARGO --------------------
  if (isCargo) {
    return (
      <div className={`${s.card} ${s.cargoCard}`}>
        <div className={s.cardHeaderCargo}>
          {data.orderNumber && (
            <div className={s.cardOrderNumber}>груз №{data.orderNumber}</div>
          )}
          <div className={s.cardTitleRow}>
            <h1 className={s.cardTitle}>
              {data.from} — {data.to}
            </h1>
            <div className={s.cardBoxIcon}>
              <img src="/images/design-icons-main/cargo.svg" alt="" />
            </div>
          </div>
          <div className={s.cardInfoRow}>
            <div className={s.cardDate}>
              <img src="/images/design-icons-main/date.svg" alt="" />
              <span>{data.ready}</span>
            </div>
            {data.rate && (
              <div className={s.cardRate}>
                <img src="/images/design-icons-main/coins.svg" alt="" />
                <span>{data.rate}</span>
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
            <div className={s.cardCustomer}>{data.customerName || "—"}</div>
            {data.telefon && (
              <div className={s.cardPhone}>
                <a href={`tel:${data.telefon}`}>{data.telefon}</a>
              </div>
            )}
            <div className={s.cardRouteBlock}>
              <div className={s.cardRouteBlockTitle}>
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{data.from}</span>
              </div>
              <img src="/images/design-icons-main/between.svg" alt="" />
              <div className={s.cardRouteBlockTitle}>
                <img src="/images/design-icons-main/place.svg" alt="" />
                <span>{data.to}</span>
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
              {data.cargo && (
                <div className={s.cardTag}>
                  <img
                    src="/images/design-icons-main/cargo-detail.svg"
                    alt=""
                  />
                  {data.cargo}
                </div>
              )}
              {data.weight && (
                <div className={s.cardTag}>
                  <img src="/images/design-icons-main/baggage.svg" alt="" />
                  {data.weight}
                </div>
              )}
              {data.volume && (
                <div className={s.cardTag}>
                  <img src="/images/design-icons-main/expand.svg" alt="" />
                  {data.volume} м³
                </div>
              )}
              {data.vehicle && (
                <div className={s.cardTag}>
                  <img src="/images/design-icons-main/gruzocar.svg" alt="" />
                  {data.vehicle}
                </div>
              )}
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
        {data.orderNumber && (
          <div className={s.cardOrderNumber}>машина №{data.orderNumber}</div>
        )}
        <div className={s.cardTitleRow}>
          <h1 className={s.cardTitle}>
            {data.otkuda} — {data.kuda}
          </h1>
          <div className={s.cardBoxIcon}>
            <img src="/images/design-icons-main/gruzocar.svg" alt="" />
          </div>
        </div>
        <div className={s.cardInfoRow}>
          <div className={s.cardDate}>
            <img src="/images/design-icons-main/date.svg" alt="" />
            <span>{data.data_gotovnosti}</span>
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
          <div className={s.cardCustomer}>{data.imya || "—"}</div>
          {data.firma && <div className={s.cardCustomer}>({data.firma})</div>}
          {data.telefon && (
            <div className={s.cardPhone}>
              <a href={`tel:${data.telefon}`}>{data.telefon}</a>
            </div>
          )}
          <div className={s.cardRouteBlock}>
            <div className={s.cardRouteBlockTitle}>
              <img src="/images/design-icons-main/place.svg" alt="" />
              <span>{data.otkuda}</span>
            </div>
            <img src="/images/design-icons-main/between.svg" alt="" />
            <div className={s.cardRouteBlockTitle}>
              <img src="/images/design-icons-main/place.svg" alt="" />
              <span>{data.kuda}</span>
            </div>
          </div>
          <div className={s.cardTagsRow}>
            {data.marka && data.tip && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/gruzocar.svg" alt="" />
                {data.marka} {data.tip}
              </div>
            )}
            {data.kuzov && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/cargo-detail.svg" alt="" />
                {data.kuzov}
              </div>
            )}
            {data.tip_zagruzki && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/baggage.svg" alt="" />
                {data.tip_zagruzki}
              </div>
            )}
            {data.gruzopodyomnost && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/expand.svg" alt="" />
                {data.gruzopodyomnost} т
              </div>
            )}
            {data.vmestimost && (
              <div className={s.cardTag}>
                <img src="/images/design-icons-main/expand.svg" alt="" />
                {data.vmestimost} м³
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Основной компонент ----------
export const ParserSwitcher = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { t } = useTranslation();

  const [currentType, setCurrentType] = useState("CargoOrder");
  const [currentTab, setCurrentTab] = useState("feed");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

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
  const [isSwitching, setIsSwitching] = useState(false);
  const [filteredFeedData, setFilteredFeedData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/allOrders");
      setResult(data);
      setFilteredFeedData([]); // Сбрасываем отфильтрованные данные при обновлении
    } catch (error) {
      console.error(t("parserSwitcher.errorLoading"), error);
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

      filtered = filtered.filter((item) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        if (isNaN(itemDate.getTime())) return false;
        if (fromD && itemDate < fromD) return false;
        if (toD && itemDate > toD) return false;
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
    setFilteredFeedData([]);
  };

  const handleApplyFilters = () => {
    if (!result) return;

    console.log("Current filters:", {
      type: currentType,
      cargoSearch,
      machineSearch,
    });

    let filtered = result.filter(
      (item) => item.orderType === currentType && !item.isArchived
    );

    console.log("Initial filtered items:", filtered.length);

    if (currentType === "CargoOrder") {
      // Применяем фильтры для грузов
      if (cargoSearch.fromDate || cargoSearch.toDate) {
        let fromD = cargoSearch.fromDate
          ? new Date(cargoSearch.fromDate)
          : null;
        if (fromD) fromD.setHours(0, 0, 0, 0);
        let toD = cargoSearch.toDate ? new Date(cargoSearch.toDate) : null;
        if (toD) toD.setHours(23, 59, 59, 999);

        console.log("Date filters:", { fromD, toD });

        filtered = filtered.filter((item) => {
          if (!item.createdAt) return false;
          const itemDate = new Date(item.createdAt);
          console.log("Item date:", itemDate, "for item:", item);
          if (isNaN(itemDate.getTime())) return false;
          if (fromD && itemDate < fromD) return false;
          if (toD && itemDate > toD) return false;
          return true;
        });
      }

      if (cargoSearch.cargoType) {
        console.log("Filtering by cargo type:", cargoSearch.cargoType);
        filtered = filtered.filter((item) => {
          if (!item.cargo) return false;
          const matches = item.cargo
            .toLowerCase()
            .includes(cargoSearch.cargoType.toLowerCase());
          console.log("Cargo match:", item.cargo, matches);
          return matches;
        });
      }

      if (cargoSearch.fromLocation) {
        console.log("Filtering by from location:", cargoSearch.fromLocation);
        filtered = filtered.filter((item) => {
          if (!item.from) return false;
          const matches = item.from
            .toLowerCase()
            .includes(cargoSearch.fromLocation.toLowerCase());
          console.log("From location match:", item.from, matches);
          return matches;
        });
      }

      if (cargoSearch.toLocation) {
        console.log("Filtering by to location:", cargoSearch.toLocation);
        filtered = filtered.filter((item) => {
          if (!item.to) return false;
          const matches = item.to
            .toLowerCase()
            .includes(cargoSearch.toLocation.toLowerCase());
          console.log("To location match:", item.to, matches);
          return matches;
        });
      }
    } else {
      // Применяем фильтры для машин
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
    }

    console.log("Final filtered items:", filtered.length);
    setFilteredFeedData(filtered);
  };

  const handleResetFilters = () => {
    if (currentType === "CargoOrder") {
      setCargoSearch({
        fromDate: "",
        toDate: "",
        cargoType: "",
        fromLocation: "",
        toLocation: "",
      });
    } else {
      setMachineSearch({
        fromDate: "",
        toDate: "",
        tonnage: "",
        fromLocation: "",
        toLocation: "",
        bodyType: "",
      });
    }
    setFilteredFeedData([]);
  };

  const feedData =
    filteredFeedData.length > 0
      ? filteredFeedData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      : result
      ? result
          .filter((item) => item.orderType === currentType && !item.isArchived)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];

  console.log("Current feed data:", feedData.length);

  const handleSwitchLocations = () => {
    setIsSwitching(true);
    setTimeout(() => {
      if (currentType === "CargoOrder") {
        setCargoSearch((cs) => ({
          ...cs,
          fromLocation: cs.toLocation,
          toLocation: cs.fromLocation,
        }));
      } else {
        setMachineSearch((ms) => ({
          ...ms,
          fromLocation: ms.toLocation,
          toLocation: ms.fromLocation,
        }));
      }
      setIsSwitching(false);
    }, 250);
  };

  if (!result) {
    return <div className={s.placeholder}>{t("parserSwitcher.noData")}</div>;
  }

  const containerStyle = {
    backgroundColor: theme === "dark" ? "#1A1A1A" : undefined,
    color: theme === "dark" ? "#ddd" : undefined,
  };

  return (
    <div className={`${s.parserSwitcher} ${isDark ? s.dark : s.light}`}>
      <div className={s.header}>
        <div className={s.switcher}>
          <div className={s.tab} onClick={() => handleTypeSwitch("CargoOrder")}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.15534 4.62136C0.0517799 4.863 0.0517799 5.09601 0.15534 5.32039C0.24164 5.54477 0.414239 5.70011 0.673139 5.78641L4.8932 6.97735C5.29018 7.06365 5.60949 6.94283 5.85113 6.61489L8 3.01618L1.65696 2.21359C1.4671 2.21359 1.32902 2.29126 1.24272 2.4466L0.15534 4.62136ZM8 3.01618L10.1489 6.61489C10.3905 6.94283 10.7098 7.06365 11.1068 6.97735L15.3269 5.78641C15.5858 5.70011 15.7584 5.54477 15.8447 5.32039C15.9482 5.09601 15.9482 4.863 15.8447 4.62136L14.7573 2.4466C14.671 2.29126 14.5329 2.21359 14.343 2.21359L8 3.01618ZM13.3851 7.18447V11.1715L8.62136 12.3625V6.12298C8.58684 5.74326 8.37972 5.53614 8 5.50162C7.62028 5.53614 7.41316 5.74326 7.37864 6.12298V12.3625L2.61489 11.1715V7.18447L1.37217 6.8479V11.1715C1.37217 11.4477 1.45847 11.698 1.63107 11.9223C1.80367 12.1467 2.02805 12.2934 2.30421 12.3625L7.61165 13.6828C7.87055 13.7519 8.13808 13.7519 8.41424 13.6828L13.6958 12.3625C13.972 12.2934 14.1963 12.1467 14.3689 11.9223C14.5415 11.7152 14.6278 11.4649 14.6278 11.1715V6.8479L13.3851 7.18447Z"
                fill="#7D97B8"
              />
            </svg>
            <span
              className={currentType === "CargoOrder" ? s.tabActive : s.tab}
            >
              Поиск груза
            </span>
          </div>
          <div
            className={s.tab}
            onClick={() => handleTypeSwitch("MachineOrder")}
          >
            <svg
              width="16"
              height="14"
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 1.8C0.0166667 1.28333 0.191667 0.858333 0.525 0.525C0.858333 0.191667 1.28333 0.0166667 1.8 0H8.2C8.71667 0.0166667 9.14167 0.191667 9.475 0.525C9.80833 0.858333 9.98333 1.28333 10 1.8V6.4C9.96667 6.76667 9.76667 6.96667 9.4 7C9.03333 6.96667 8.83333 6.76667 8.8 6.4V1.8C8.76667 1.43333 8.56667 1.23333 8.2 1.2H1.8C1.43333 1.23333 1.23333 1.43333 1.2 1.8V6.4C1.16667 6.76667 0.966667 6.96667 0.6 7C0.233333 6.96667 0.0333333 6.76667 0 6.4V1.8ZM15.2 9.2C15.1833 9.76667 14.9917 10.2417 14.625 10.625C14.2417 10.9917 13.7667 11.1833 13.2 11.2C12.6333 11.1833 12.1583 10.9917 11.775 10.625C11.4083 10.2417 11.2167 9.76667 11.2 9.2H10.8H7.2C7.18333 9.76667 6.99167 10.2417 6.625 10.625C6.24167 10.9917 5.76667 11.1833 5.2 11.2C4.51667 11.1833 3.98333 10.9167 3.6 10.4C3.21667 10.9167 2.68333 11.1833 2 11.2C1.43333 11.1833 0.958333 10.9917 0.575 10.625C0.208333 10.2417 0.0166667 9.76667 0 9.2C0.0166667 8.63333 0.208333 8.15833 0.575 7.775C0.958333 7.40833 1.43333 7.21667 2 7.2C2.68333 7.21667 3.21667 7.48333 3.6 8C3.98333 7.48333 4.51667 7.21667 5.2 7.2C5.88333 7.21667 6.41667 7.48333 6.8 8H10.8V5.6V3.4C10.8333 3.03333 11.0333 2.83333 11.4 2.8H13.225C13.6583 2.81667 14.0167 2.99167 14.3 3.325L15.775 5.1C15.925 5.28333 16 5.5 16 5.75V6V6.4V8.4C16 8.63333 15.925 8.825 15.775 8.975C15.625 9.125 15.4333 9.2 15.2 9.2ZM14.625 5.6L13.375 4.075C13.3417 4.025 13.2917 4 13.225 4H12V5.6H14.625ZM3.4 2.6V5.8C3.36667 6.16667 3.16667 6.36667 2.8 6.4C2.43333 6.36667 2.23333 6.16667 2.2 5.8V2.6C2.23333 2.23333 2.43333 2.03333 2.8 2C3.16667 2.03333 3.36667 2.23333 3.4 2.6ZM5.6 2.6V5.8C5.56667 6.16667 5.36667 6.36667 5 6.4C4.63333 6.36667 4.43333 6.16667 4.4 5.8V2.6C4.43333 2.23333 4.63333 2.03333 5 2C5.36667 2.03333 5.56667 2.23333 5.6 2.6ZM7.8 2.6V5.8C7.76667 6.16667 7.56667 6.36667 7.2 6.4C6.83333 6.36667 6.63333 6.16667 6.6 5.8V2.6C6.63333 2.23333 6.83333 2.03333 7.2 2C7.56667 2.03333 7.76667 2.23333 7.8 2.6ZM13.2 10C13.4333 10 13.625 9.925 13.775 9.775C13.925 9.625 14 9.43333 14 9.2C14 8.96667 13.925 8.775 13.775 8.625C13.625 8.475 13.4333 8.4 13.2 8.4C12.9667 8.4 12.775 8.475 12.625 8.625C12.475 8.775 12.4 8.96667 12.4 9.2C12.4 9.43333 12.475 9.625 12.625 9.775C12.775 9.925 12.9667 10 13.2 10ZM6 9.2C6 8.96667 5.925 8.775 5.775 8.625C5.625 8.475 5.43333 8.4 5.2 8.4C4.96667 8.4 4.775 8.475 4.625 8.625C4.475 8.775 4.4 8.96667 4.4 9.2C4.4 9.43333 4.475 9.625 4.625 9.775C4.775 9.925 4.96667 10 5.2 10C5.43333 10 5.625 9.925 5.775 9.775C5.925 9.625 6 9.43333 6 9.2ZM2 10C2.23333 10 2.425 9.925 2.575 9.775C2.725 9.625 2.8 9.43333 2.8 9.2C2.8 8.96667 2.725 8.775 2.575 8.625C2.425 8.475 2.23333 8.4 2 8.4C1.76667 8.4 1.575 8.475 1.425 8.625C1.275 8.775 1.2 8.96667 1.2 9.2C1.2 9.43333 1.275 9.625 1.425 9.775C1.575 9.925 1.76667 10 2 10Z"
                fill="#7D97B8"
              />
            </svg>
            <span
              className={currentType === "MachineOrder" ? s.tabActive : s.tab}
            >
              Поиск машины
            </span>
          </div>
        </div>
        <div className={s.filtersBlock}>
          <div className={s.filterRow}>
            <div className={s.filterItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5088 6.01174C12.4671 4.73842 12.0287 3.67384 11.1937 2.818C10.3379 1.98304 9.27332 1.54468 8 1.50294C6.72668 1.54468 5.6621 1.98304 4.80626 2.818C3.9713 3.67384 3.53294 4.73842 3.49119 6.01174C3.49119 6.40835 3.64775 7.00326 3.96086 7.79648C4.31572 8.58969 4.76451 9.42466 5.30724 10.3014C5.76647 11.032 6.2257 11.7312 6.68493 12.3992C7.16504 13.0672 7.60339 13.6517 8 14.1526C8.39661 13.6517 8.83496 13.0672 9.31507 12.3992C9.79517 11.7312 10.2544 11.032 10.6928 10.3014C11.2355 9.42466 11.6843 8.58969 12.0391 7.79648C12.3523 7.00326 12.5088 6.40835 12.5088 6.01174ZM14.0117 6.01174C13.97 6.95108 13.636 8.03653 13.0098 9.2681C12.3627 10.4997 11.6321 11.6895 10.818 12.8376C10.0039 14.0065 9.31507 14.9354 8.75147 15.6243C8.54273 15.8748 8.29224 16 8 16C7.70776 16 7.45727 15.8748 7.24853 15.6243C6.68493 14.9354 5.99609 14.0065 5.182 12.8376C4.36791 11.6895 3.63731 10.4997 2.99022 9.2681C2.36399 8.03653 2.03001 6.95108 1.98826 6.01174C2.03001 4.30007 2.61448 2.88063 3.74168 1.75342C4.86888 0.626223 6.28832 0.0417482 8 0C9.71168 0.0417482 11.1311 0.626223 12.2583 1.75342C13.3855 2.88063 13.97 4.30007 14.0117 6.01174ZM9.00196 6.01174C9.00196 5.7195 8.90802 5.47945 8.72016 5.29158C8.53229 5.10372 8.29224 5.00978 8 5.00978C7.70776 5.00978 7.46771 5.10372 7.27984 5.29158C7.09198 5.47945 6.99804 5.7195 6.99804 6.01174C6.99804 6.30398 7.09198 6.54403 7.27984 6.7319C7.46771 6.91977 7.70776 7.0137 8 7.0137C8.29224 7.0137 8.53229 6.91977 8.72016 6.7319C8.90802 6.54403 9.00196 6.30398 9.00196 6.01174ZM5.49511 6.01174C5.51598 5.07241 5.93346 4.35225 6.74755 3.85127C7.58252 3.39204 8.41748 3.39204 9.25245 3.85127C10.0665 4.35225 10.484 5.07241 10.5049 6.01174C10.484 6.95108 10.0665 7.67123 9.25245 8.17221C8.41748 8.63144 7.58252 8.63144 6.74755 8.17221C5.93346 7.67123 5.51598 6.95108 5.49511 6.01174Z"
                  fill="#356DBB"
                />
              </svg>
              <input
                className={s.filterInput}
                type="text"
                placeholder="Откуда"
                value={
                  currentType === "CargoOrder"
                    ? cargoSearch.fromLocation
                    : machineSearch.fromLocation
                }
                onChange={(e) =>
                  currentType === "CargoOrder"
                    ? setCargoSearch({
                        ...cargoSearch,
                        fromLocation: e.target.value,
                      })
                    : setMachineSearch({
                        ...machineSearch,
                        fromLocation: e.target.value,
                      })
                }
                autoComplete="off"
              />
            </div>
            <div
              className={`${s.switchBtn} ${
                isSwitching ? s.switchBtnActive : ""
              }`}
              onClick={handleSwitchLocations}
              style={{ cursor: "pointer" }}
            >
              <span className={s.iconSwitch} />
            </div>
          </div>

          <div className={s.filterRow}>
            <div className={s.filterItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5088 6.01174C12.4671 4.73842 12.0287 3.67384 11.1937 2.818C10.3379 1.98304 9.27332 1.54468 8 1.50294C6.72668 1.54468 5.6621 1.98304 4.80626 2.818C3.9713 3.67384 3.53294 4.73842 3.49119 6.01174C3.49119 6.40835 3.64775 7.00326 3.96086 7.79648C4.31572 8.58969 4.76451 9.42466 5.30724 10.3014C5.76647 11.032 6.2257 11.7312 6.68493 12.3992C7.16504 13.0672 7.60339 13.6517 8 14.1526C8.39661 13.6517 8.83496 13.0672 9.31507 12.3992C9.79517 11.7312 10.2544 11.032 10.6928 10.3014C11.2355 9.42466 11.6843 8.58969 12.0391 7.79648C12.3523 7.00326 12.5088 6.40835 12.5088 6.01174ZM14.0117 6.01174C13.97 6.95108 13.636 8.03653 13.0098 9.2681C12.3627 10.4997 11.6321 11.6895 10.818 12.8376C10.0039 14.0065 9.31507 14.9354 8.75147 15.6243C8.54273 15.8748 8.29224 16 8 16C7.70776 16 7.45727 15.8748 7.24853 15.6243C6.68493 14.9354 5.99609 14.0065 5.182 12.8376C4.36791 11.6895 3.63731 10.4997 2.99022 9.2681C2.36399 8.03653 2.03001 6.95108 1.98826 6.01174C2.03001 4.30007 2.61448 2.88063 3.74168 1.75342C4.86888 0.626223 6.28832 0.0417482 8 0C9.71168 0.0417482 11.1311 0.626223 12.2583 1.75342C13.3855 2.88063 13.97 4.30007 14.0117 6.01174ZM9.00196 6.01174C9.00196 5.7195 8.90802 5.47945 8.72016 5.29158C8.53229 5.10372 8.29224 5.00978 8 5.00978C7.70776 5.00978 7.46771 5.10372 7.27984 5.29158C7.09198 5.47945 6.99804 5.7195 6.99804 6.01174C6.99804 6.30398 7.09198 6.54403 7.27984 6.7319C7.46771 6.91977 7.70776 7.0137 8 7.0137C8.29224 7.0137 8.53229 6.91977 8.72016 6.7319C8.90802 6.54403 9.00196 6.30398 9.00196 6.01174ZM5.49511 6.01174C5.51598 5.07241 5.93346 4.35225 6.74755 3.85127C7.58252 3.39204 8.41748 3.39204 9.25245 3.85127C10.0665 4.35225 10.484 5.07241 10.5049 6.01174C10.484 6.95108 10.0665 7.67123 9.25245 8.17221C8.41748 8.63144 7.58252 8.63144 6.74755 8.17221C5.93346 7.67123 5.51598 6.95108 5.49511 6.01174Z"
                  fill="#356DBB"
                />
              </svg>
              <input
                className={s.filterInput}
                type="text"
                placeholder="Куда"
                value={
                  currentType === "CargoOrder"
                    ? cargoSearch.toLocation
                    : machineSearch.toLocation
                }
                onChange={(e) =>
                  currentType === "CargoOrder"
                    ? setCargoSearch({
                        ...cargoSearch,
                        toLocation: e.target.value,
                      })
                    : setMachineSearch({
                        ...machineSearch,
                        toLocation: e.target.value,
                      })
                }
                autoComplete="off"
              />
            </div>
          </div>

          {currentType === "MachineOrder" && (
            <div className={s.filterRow}>
              <div className={s.filterItem}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 1.8C0.0166667 1.28333 0.191667 0.858333 0.525 0.525C0.858333 0.191667 1.28333 0.0166667 1.8 0H8.2C8.71667 0.0166667 9.14167 0.191667 9.475 0.525C9.80833 0.858333 9.98333 1.28333 10 1.8V6.4C9.96667 6.76667 9.76667 6.96667 9.4 7C9.03333 6.96667 8.83333 6.76667 8.8 6.4V1.8C8.76667 1.43333 8.56667 1.23333 8.2 1.2H1.8C1.43333 1.23333 1.23333 1.43333 1.2 1.8V6.4C1.16667 6.76667 0.966667 6.96667 0.6 7C0.233333 6.96667 0.0333333 6.76667 0 6.4V1.8ZM15.2 9.2C15.1833 9.76667 14.9917 10.2417 14.625 10.625C14.2417 10.9917 13.7667 11.1833 13.2 11.2C12.6333 11.1833 12.1583 10.9917 11.775 10.625C11.4083 10.2417 11.2167 9.76667 11.2 9.2H10.8H7.2C7.18333 9.76667 6.99167 10.2417 6.625 10.625C6.24167 10.9917 5.76667 11.1833 5.2 11.2C4.51667 11.1833 3.98333 10.9167 3.6 10.4C3.21667 10.9167 2.68333 11.1833 2 11.2C1.43333 11.1833 0.958333 10.9917 0.575 10.625C0.208333 10.2417 0.0166667 9.76667 0 9.2C0.0166667 8.63333 0.208333 8.15833 0.575 7.775C0.958333 7.40833 1.43333 7.21667 2 7.2C2.68333 7.21667 3.21667 7.48333 3.6 8C3.98333 7.48333 4.51667 7.21667 5.2 7.2C5.88333 7.21667 6.41667 7.48333 6.8 8H10.8V5.6V3.4C10.8333 3.03333 11.0333 2.83333 11.4 2.8H13.225C13.6583 2.81667 14.0167 2.99167 14.3 3.325L15.775 5.1C15.925 5.28333 16 5.5 16 5.75V6V6.4V8.4C16 8.63333 15.925 8.825 15.775 8.975C15.625 9.125 15.4333 9.2 15.2 9.2ZM14.625 5.6L13.375 4.075C13.3417 4.025 13.2917 4 13.225 4H12V5.6H14.625ZM3.4 2.6V5.8C3.36667 6.16667 3.16667 6.36667 2.8 6.4C2.43333 6.36667 2.23333 6.16667 2.2 5.8V2.6C2.23333 2.23333 2.43333 2.03333 2.8 2C3.16667 2.03333 3.36667 2.23333 3.4 2.6ZM5.6 2.6V5.8C5.56667 6.16667 5.36667 6.36667 5 6.4C4.63333 6.36667 4.43333 6.16667 4.4 5.8V2.6C4.43333 2.23333 4.63333 2.03333 5 2C5.36667 2.03333 5.56667 2.23333 5.6 2.6ZM7.8 2.6V5.8C7.76667 6.16667 7.56667 6.36667 7.2 6.4C6.83333 6.36667 6.63333 6.16667 6.6 5.8V2.6C6.63333 2.23333 6.83333 2.03333 7.2 2C7.56667 2.03333 7.76667 2.23333 7.8 2.6ZM13.2 10C13.4333 10 13.625 9.925 13.775 9.775C13.925 9.625 14 9.43333 14 9.2C14 8.96667 13.925 8.775 13.775 8.625C13.625 8.475 13.4333 8.4 13.2 8.4C12.9667 8.4 12.775 8.475 12.625 8.625C12.475 8.775 12.4 8.96667 12.4 9.2C12.4 9.43333 12.475 9.625 12.625 9.775C12.775 9.925 12.9667 10 13.2 10ZM6 9.2C6 8.96667 5.925 8.775 5.775 8.625C5.625 8.475 5.43333 8.4 5.2 8.4C4.96667 8.4 4.775 8.475 4.625 8.625C4.475 8.775 4.4 8.96667 4.4 9.2C4.4 9.43333 4.475 9.625 4.625 9.775C4.775 9.925 4.96667 10 5.2 10C5.43333 10 5.625 9.925 5.775 9.775C5.925 9.625 6 9.43333 6 9.2ZM2 10C2.23333 10 2.425 9.925 2.575 9.775C2.725 9.625 2.8 9.43333 2.8 9.2C2.8 8.96667 2.725 8.775 2.575 8.625C2.425 8.475 2.23333 8.4 2 8.4C1.76667 8.4 1.575 8.475 1.425 8.625C1.275 8.775 1.2 8.96667 1.2 9.2C1.2 9.43333 1.275 9.625 1.425 9.775C1.575 9.925 1.76667 10 2 10Z"
                    fill="#356DBB"
                  />
                </svg>
                <select
                  className={s.filterInput}
                  value={machineSearch.bodyType}
                  onChange={(e) =>
                    setMachineSearch({
                      ...machineSearch,
                      bodyType: e.target.value,
                    })
                  }
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    background: "transparent",
                    fontWeight: machineSearch.bodyType ? 700 : 700,
                    color: machineSearch.bodyType ? "#222" : "#B0B0B0",
                  }}
                >
                  <option value="" disabled hidden>
                    Тип кузова
                  </option>
                  <option value="Тент">Тент</option>
                  <option value="Рефрижератор">Рефрижератор</option>
                </select>
              </div>
            </div>
          )}
          <div className={s.filterRowBottom}>
            <div className={s.filterItemBottom}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.75 0.75C5.70833 0.291667 5.45833 0.0416667 5 0C4.54167 0.0416667 4.29167 0.291667 4.25 0.75V2H3C2.4375 2.02083 1.96875 2.21875 1.59375 2.59375C1.21875 2.96875 1.02083 3.4375 1 4V4.5V6V14C1.02083 14.5625 1.21875 15.0312 1.59375 15.4062C1.96875 15.7812 2.4375 15.9792 3 16H13C13.5625 15.9792 14.0312 15.7812 14.4062 15.4062C14.7812 15.0312 14.9792 14.5625 15 14V6V4.5V4C14.9792 3.4375 14.7812 2.96875 14.4062 2.59375C14.0312 2.21875 13.5625 2.02083 13 2H11.75V0.75C11.7083 0.291667 11.4583 0.0416667 11 0C10.5417 0.0416667 10.2917 0.291667 10.25 0.75V2H5.75V0.75ZM2.5 6H13.5V14C13.4792 14.3125 13.3125 14.4792 13 14.5H3C2.6875 14.4792 2.52083 14.3125 2.5 14V6ZM4 8.75C4.04167 9.20833 4.29167 9.45833 4.75 9.5H11.25C11.7083 9.45833 11.9583 9.20833 12 8.75C11.9583 8.29167 11.7083 8.04167 11.25 8H4.75C4.29167 8.04167 4.04167 8.29167 4 8.75ZM4.75 11C4.29167 11.0417 4.04167 11.2917 4 11.75C4.04167 12.2083 4.29167 12.4583 4.75 12.5H8.25C8.70833 12.4583 8.95833 12.2083 9 11.75C8.95833 11.2917 8.70833 11.0417 8.25 11H4.75Z"
                  fill="#356DBB"
                />
              </svg>
              <input
                className={s.filterInput}
                type="date"
                placeholder="Выбрать дату"
                value={
                  currentType === "CargoOrder"
                    ? cargoSearch.fromDate
                    : machineSearch.fromDate
                }
                onChange={(e) =>
                  currentType === "CargoOrder"
                    ? setCargoSearch({
                        ...cargoSearch,
                        fromDate: e.target.value,
                      })
                    : setMachineSearch({
                        ...machineSearch,
                        fromDate: e.target.value,
                      })
                }
              />
            </div>
            <div className={s.filterItemBottom}>
              {currentType === "CargoOrder" ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.155337 4.62136C0.0517773 4.863 0.0517773 5.09601 0.155337 5.32039C0.241637 5.54477 0.414237 5.70011 0.673136 5.78641L4.8932 6.97735C5.29018 7.06365 5.60949 6.94283 5.85113 6.61489L8 3.01618L1.65696 2.21359C1.4671 2.21359 1.32902 2.29126 1.24272 2.4466L0.155337 4.62136ZM8 3.01618L10.1489 6.61489C10.3905 6.94283 10.7098 7.06365 11.1068 6.97735L15.3269 5.78641C15.5858 5.70011 15.7584 5.54477 15.8447 5.32039C15.9482 5.09601 15.9482 4.863 15.8447 4.62136L14.7573 2.4466C14.671 2.29126 14.5329 2.21359 14.343 2.21359L8 3.01618ZM13.3851 7.18447V11.1715L8.62136 12.3625V6.12298C8.58684 5.74326 8.37972 5.53614 8 5.50162C7.62028 5.53614 7.41316 5.74326 7.37864 6.12298V12.3625L2.61488 11.1715V7.18447L1.37217 6.8479V11.1715C1.37217 11.4477 1.45847 11.698 1.63107 11.9223C1.80367 12.1467 2.02804 12.2934 2.3042 12.3625L7.61165 13.6828C7.87055 13.7519 8.13808 13.7519 8.41424 13.6828L13.6958 12.3625C13.9719 12.2934 14.1963 12.1467 14.3689 11.9223C14.5415 11.7152 14.6278 11.4649 14.6278 11.1715V6.8479L13.3851 7.18447Z"
                      fill="#356DBB"
                    />
                  </svg>
                  <input
                    className={s.filterInput}
                    type="text"
                    placeholder="Тип груза"
                    value={cargoSearch.cargoType}
                    onChange={(e) =>
                      setCargoSearch({
                        ...cargoSearch,
                        cargoType: e.target.value,
                      })
                    }
                    autoComplete="off"
                  />
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.155337 4.62136C0.0517773 4.863 0.0517773 5.09601 0.155337 5.32039C0.241637 5.54477 0.414237 5.70011 0.673136 5.78641L4.8932 6.97735C5.29018 7.06365 5.60949 6.94283 5.85113 6.61489L8 3.01618L1.65696 2.21359C1.4671 2.21359 1.32902 2.29126 1.24272 2.4466L0.155337 4.62136ZM8 3.01618L10.1489 6.61489C10.3905 6.94283 10.7098 7.06365 11.1068 6.97735L15.3269 5.78641C15.5858 5.70011 15.7584 5.54477 15.8447 5.32039C15.9482 5.09601 15.9482 4.863 15.8447 4.62136L14.7573 2.4466C14.671 2.29126 14.5329 2.21359 14.343 2.21359L8 3.01618ZM13.3851 7.18447V11.1715L8.62136 12.3625V6.12298C8.58684 5.74326 8.37972 5.53614 8 5.50162C7.62028 5.53614 7.41316 5.74326 7.37864 6.12298V12.3625L2.61488 11.1715V7.18447L1.37217 6.8479V11.1715C1.37217 11.4477 1.45847 11.698 1.63107 11.9223C1.80367 12.1467 2.02804 12.2934 2.3042 12.3625L7.61165 13.6828C7.87055 13.7519 8.13808 13.7519 8.41424 13.6828L13.6958 12.3625C13.9719 12.2934 14.1963 12.1467 14.3689 11.9223C14.5415 11.7152 14.6278 11.4649 14.6278 11.1715V6.8479L13.3851 7.18447Z"
                      fill="#356DBB"
                    />
                  </svg>
                  <input
                    className={s.filterInput}
                    type="text"
                    placeholder="Тоннаж"
                    value={machineSearch.tonnage}
                    onChange={(e) =>
                      setMachineSearch({
                        ...machineSearch,
                        tonnage: e.target.value,
                      })
                    }
                    autoComplete="off"
                  />
                </>
              )}
            </div>
          </div>

          {/* Блок с кнопками применения и сброса фильтров */}
        </div>
      </div>

      {currentTab === "feed" && (
        <ReactPullToRefresh
          onRefresh={fetchData}
          pullingContent={
            <div className={s.loading}>{t("parserSwitcher.pullToRefresh")}</div>
          }
          refreshingContent={
            <div className={s.loading}>{t("parserSwitcher.refreshing")}</div>
          }
          resistance={2.5}
        >
          <div
            className={s.resultContainer}
            style={{
              backgroundColor: theme === "dark" ? "#000" : "#fff",
            }}
          >
            <div className={s.cardsGrid}>
              {feedData.length > 0 ? (
                feedData.map((item, index) => <Card key={index} data={item} />)
              ) : (
                <p className={s.placeholder}>
                  {filteredFeedData.length === 0 &&
                  (cargoSearch.fromDate ||
                    cargoSearch.toDate ||
                    cargoSearch.cargoType ||
                    cargoSearch.fromLocation ||
                    cargoSearch.toLocation)
                    ? t("parserSwitcher.noOrdersByFilters")
                    : t("parserSwitcher.noOrdersByType")}
                </p>
              )}
            </div>
          </div>
        </ReactPullToRefresh>
      )}

      {currentTab === "search" && (
        <div className={s.searchContainer}>
          {currentType === "CargoOrder" ? (
            <div className={s.filterContainer}>
              <div className={s.filterGroup}>
                <label className={s.filterLabel}>
                  {t("parserSwitcher.dateFrom")}
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
                  {t("parserSwitcher.dateTo")}
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
                  {t("parserSwitcher.cargoType")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.exampleCargoType")}
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
                  {t("parserSwitcher.fromLocation")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.departureCity")}
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
                  {t("parserSwitcher.toLocation")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.arrivalCity")}
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
                  {t("parserSwitcher.find")}
                </button>
                <button className={s.reset} onClick={handleResetCargo}>
                  {t("parserSwitcher.reset")}
                </button>
              </div>
            </div>
          ) : (
            <div className={s.filterContainer}>
              <div className={s.filterGroup}>
                <label className={s.filterLabel}>
                  {t("parserSwitcher.readyDate")}
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
                  {t("parserSwitcher.tonnage")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.exampleTonnage")}
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
                  {t("parserSwitcher.fromLocation")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.departureLocation")}
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
                  {t("parserSwitcher.toLocation")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.destinationLocation")}
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
                  {t("parserSwitcher.bodyType")}
                  <input
                    type="text"
                    placeholder={t("parserSwitcher.exampleBodyType")}
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
                  {t("parserSwitcher.find")}
                </button>
                <button className={s.reset} onClick={handleResetMachine}>
                  {t("parserSwitcher.reset")}
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
              <p className={s.placeholder}>
                {t("parserSwitcher.noOrdersByFilters")}
              </p>
            )
          )}
        </div>
      )}
      <div
        style={{
          position: "fixed",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <button className={s.applyButton} onClick={handleApplyFilters}>
          {t("parserSwitcher.apply")}
        </button>
      </div>
    </div>
  );
};
