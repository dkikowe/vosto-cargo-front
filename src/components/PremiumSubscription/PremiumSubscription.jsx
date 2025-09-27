import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import styles from "./PremiumSubscription.module.scss";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "../../axios";

const PremiumSubscription = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const isDark = theme === "dark";
  // поддерживаем оба ключа в localStorage
  const userId = localStorage.getItem("userId") || localStorage.getItem("id");

  // Загружаем данные пользователя
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (!userId) {
          setIsLoading(false);
          return;
        }
        const res = await axios.get(`/getUserById/${userId}`);
        if (!ignore && res.data) {
          setUser(res.data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const tariffs = [
    {
      id: "single",
      name: "Разовый",
      duration: "1 неделя",
      price: 1000,
      features: ["Лимит 30 заявок в день"],
    },
    {
      id: "minimal",
      name: "Минимальный",
      duration: "1 месяц",
      price: 3990,
      features: ["Неограниченное количество заявок", "Полный доступ"],
    },
    {
      id: "standard-3m",
      name: "Стандарт -33%",
      duration: "3 месяца",
      price: 7990,
      features: [
        "Неограниченное количество заявок",
        "Полный доступ",
        "2 690 ₽ / месяц",
      ],
    },
    {
      id: "standard-12m",
      name: "Стандарт -50%",
      duration: "12 месяцев",
      price: 23990,
      features: [
        "Неограниченное количество заявок",
        "Полный доступ",
        "1 990 ₽ / месяц",
      ],
    },
  ];

  const handlePurchase = async (tariff) => {
    try {
      if (!userId) {
        alert("Пользователь не авторизован");
        return;
      }
      const response = await axios.post("/api/payments/robokassa/create", {
        userId,
        amount: tariff.price,
        plan: tariff.id,
      });
      if (response.data?.payUrl) {
        localStorage.setItem("selectedTariff", JSON.stringify(tariff));
        window.location.href = response.data.payUrl;
      } else {
        alert("Ошибка при создании ссылки оплаты");
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось перейти к оплате");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      if (!userId) {
        alert("Пользователь не авторизован");
        return;
      }
      const response = await axios.post("/api/subscription/cancel", { userId });
      if (response.data?.success) {
        alert("Подписка успешно отменена");
        const userResponse = await axios.get(`/getUserById/${userId}`);
        if (userResponse.data) setUser(userResponse.data);
      } else {
        alert("Ошибка при отмене подписки");
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось отменить подписку");
    }
  };

  const containerStyle = {
    backgroundColor: isDark ? "#121212" : "",
    color: isDark ? "#fff" : "#000",
    minHeight: "100vh",
  };
  const background = isDark ? "#121212" : "";
  const bgCard = isDark ? "#1e1e1e" : "";

  // Текущий тариф
  const getCurrentTariff = () => {
    const plan = user?.subscription?.plan;
    if (!plan) return null;
    return tariffs.find((t) => t.id === plan) || null;
  };

  const currentTariff = getCurrentTariff();

  // Активность подписки по status + expiresAt
  const hasActiveSubscription =
    !!user?.subscription &&
    user.subscription.status === "active" &&
    user.subscription.expiresAt &&
    new Date(user.subscription.expiresAt) > new Date();

  const formatExpirationDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  if (isLoading) {
    return (
      <div
        className={styles.container}
        style={{ backgroundColor: background, minHeight: "100vh" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: isDark ? "#fff" : "#000",
          }}
        >
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.header} style={{ background: background }}>
        <ChevronLeft
          onClick={() => navigate("/menu")}
          style={{ cursor: "pointer", color: isDark ? "#fff" : "#fff" }}
        />
        <h1>Премиум подписка</h1>
      </div>

      {hasActiveSubscription && currentTariff ? (
        <div className={styles.currentSubscription}>
          <h2 style={{ color: isDark ? "#fff" : "#000", marginBottom: "20px" }}>
            Ваша подписка
          </h2>

          <div
            className={styles.subscriptionCard}
            style={{
              backgroundColor: bgCard,
              color: isDark ? "#fff" : "",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <div className={styles.subscriptionHeader}>
              <h3 style={{ color: isDark ? "#fff" : "", margin: "0 0 10px 0" }}>
                {currentTariff.name}
              </h3>
              <p
                style={{
                  color: isDark ? "#bbb" : "#666",
                  margin: "0 0 15px 0",
                }}
              >
                {currentTariff.duration}
              </p>
            </div>

            {currentTariff.features?.length > 0 && (
              <div className={styles.featuresList}>
                <h4
                  style={{ color: isDark ? "#fff" : "", margin: "0 0 10px 0" }}
                >
                  Включено в подписку:
                </h4>
                {currentTariff.features.map((feature, idx) => (
                  <div
                    className={styles.featureItem}
                    key={idx}
                    style={{ color: isDark ? "#fff" : "", marginBottom: "5px" }}
                  >
                    • {feature}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.subscriptionInfo}>
              <p style={{ color: isDark ? "#bbb" : "#666", margin: "10px 0" }}>
                Истекает: {formatExpirationDate(user?.subscription?.expiresAt)}
              </p>
            </div>

            <button
              onClick={handleCancelSubscription}
              style={{
                backgroundColor: "#ff4444",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "15px",
              }}
            >
              Отменить подписку
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.tariffs}>
          <h2 style={{ cursor: "pointer", color: isDark ? "#fff" : "#000" }}>
            Тарифы для перевозчиков
          </h2>
          <div className={styles.tariffGrid}>
            {tariffs.map((tariff) => (
              <div
                key={tariff.id}
                className={styles.singleTariffCard}
                style={{ backgroundColor: bgCard, color: isDark ? "#fff" : "" }}
              >
                <div className={styles.topRow}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      className={styles.tariffName}
                      style={{ color: isDark ? "#fff" : "" }}
                    >
                      {tariff.name}
                    </span>
                    <div className={styles.durationRow}>
                      <span
                        className={styles.duration}
                        style={{ color: isDark ? "#fff" : "" }}
                      >
                        {tariff.duration}
                      </span>
                    </div>
                  </div>
                  <span
                    className={styles.tariffPrice}
                    style={{ color: isDark ? "#fff" : "" }}
                  >
                    {tariff.price.toLocaleString()} ₽
                  </span>
                </div>

                {tariff.features?.length > 0 && (
                  <div className={styles.featuresList}>
                    {tariff.features.map((feature, idx) => (
                      <div
                        className={styles.featureItem}
                        key={idx}
                        style={{ color: isDark ? "#fff" : "" }}
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.rightBlock}>
                  <span className={styles.rubTon}>RUB / TON</span>
                  <span
                    className={styles.payLink}
                    style={{ cursor: "pointer", color: "#4CAF50" }}
                    onClick={() => handlePurchase(tariff)}
                  >
                    Оплатить
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSubscription;
