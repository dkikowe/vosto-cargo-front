import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import styles from "./PremiumSubscription.module.scss";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "../../axios";

const PremiumSubscription = () => {
  const [selectedTariff, setSelectedTariff] = useState(null);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const isDark = theme === "dark";

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
      const userId = localStorage.getItem("id");

      if (!userId) {
        alert("Пользователь не авторизован");
        return;
      }

      const response = await axios.post("/api/payments/robokassa/create", {
        userId,
        amount: tariff.price,
      });

      if (response.data?.payUrl) {
        window.location.href = response.data.payUrl;
      } else {
        alert("Ошибка при создании ссылки оплаты");
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось перейти к оплате");
    }
  };

  const containerStyle = {
    backgroundColor: isDark ? "#121212" : "",
    color: isDark ? "#fff" : "#000",
    minHeight: "100vh",
  };

  const background = isDark ? "#121212" : "";
  const bgCard = isDark ? "#1e1e1e" : "";

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.header} style={{ background: background }}>
        <ChevronLeft
          onClick={() => navigate("/menu")}
          style={{ cursor: "pointer", color: isDark ? "#fff" : "#fff" }}
        />
        <h1>Премиум подписка</h1>
      </div>

      <div className={styles.tariffs}>
        <h2 style={{ cursor: "pointer", color: isDark ? "#fff" : "#000" }}>
          Тарифы для перевозчиков
        </h2>
        <div className={styles.tariffGrid}>
          {tariffs.map((tariff, idx) => (
            <div
              key={tariff.id}
              className={styles.singleTariffCard}
              style={{
                backgroundColor: bgCard,
                color: isDark ? "#fff" : "",
              }}
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

              {tariff.features && tariff.features.length > 0 && (
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
                {/* 👇 кнопка работает только для первой карточки */}
                {idx === 0 ? (
                  <span
                    className={styles.payLink}
                    style={{ cursor: "pointer", color: "#4CAF50" }}
                    onClick={() => handlePurchase(tariff)}
                  >
                    Оплатить
                  </span>
                ) : (
                  <span className={styles.payLink}>Оплатить</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscription;
