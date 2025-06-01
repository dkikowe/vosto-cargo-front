import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import styles from "./PremiumSubscription.module.scss";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

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

  const additionalOptions = [
    {
      id: "extra-contact",
      name: "Доп. контакт",
      price: 590,
      duration: "25 дней",
      description: "10 заявок в день",
    },
    {
      id: "all-machines",
      name: "Все машины",
      price: 490,
      duration: "25 дней",
      description: "Доступ к контактной информации всех перевозчиков",
    },
    {
      id: "ratings",
      name: "Просмотр рейтингов",
      price: 1990,
      duration: "25 дней",
      description: "Просмотр рейтинга перевозчиков и грузоотправителей",
    },
  ];

  const handleTariffSelect = (tariffId) => {
    setSelectedTariff(tariffId);
  };

  const handlePurchase = () => {
    console.log("Покупка тарифа:", selectedTariff);
  };

  const cardStyle = {
    backgroundColor: isDark ? "#1e1e1e" : "#fff",
    color: isDark ? "#fff" : "#000",
    border: isDark ? "1px solid #444" : "1px solid #ddd",
  };

  const containerStyle = {
    backgroundColor: isDark ? "#121212" : "#f9f9f9",
    color: isDark ? "#fff" : "#000",
    minHeight: "100vh",
  };

  const buttonStyle = {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.header}>
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
          {tariffs.map((tariff) => (
            <div
              key={tariff.id}
              className={styles.singleTariffCard}
              onClick={() => handleTariffSelect(tariff.id)}
            >
              <div className={styles.topRow}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <span className={styles.tariffName}>{tariff.name}</span>
                  <div className={styles.durationRow}>
                    <svg
                      width="15"
                      height="13"
                      viewBox="0 0 15 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.11111 0C4.46759 0.0324074 4.66204 0.226852 4.69444 0.583333V1.55556H8.19444V0.583333C8.22685 0.226852 8.4213 0.0324074 8.77778 0C9.13426 0.0324074 9.3287 0.226852 9.36111 0.583333V1.55556H10.3333C10.7708 1.57176 11.1354 1.72569 11.4271 2.01736C11.7188 2.30903 11.8727 2.67361 11.8889 3.11111V3.5V4.66667H11.5H2.16667V10.8889C2.18287 11.1319 2.3125 11.2616 2.55556 11.2778H7.92708C8.21875 11.7315 8.59144 12.1204 9.04514 12.4444H2.55556C2.11806 12.4282 1.75347 12.2743 1.46181 11.9826C1.17014 11.691 1.0162 11.3264 1 10.8889V4.66667V3.5V3.11111C1.0162 2.67361 1.17014 2.30903 1.46181 2.01736C1.75347 1.72569 2.11806 1.57176 2.55556 1.55556H3.52778V0.583333C3.56019 0.226852 3.75463 0.0324074 4.11111 0ZM8 8.94444C8 8.3125 8.15393 7.72917 8.46181 7.19444C8.76968 6.65972 9.19907 6.23032 9.75 5.90625C10.3009 5.59838 10.8843 5.44444 11.5 5.44444C12.1157 5.44444 12.6991 5.59838 13.25 5.90625C13.8009 6.23032 14.2303 6.65972 14.5382 7.19444C14.8461 7.72917 15 8.3125 15 8.94444C15 9.57639 14.8461 10.1597 14.5382 10.6944C14.2303 11.2292 13.8009 11.6586 13.25 11.9826C12.6991 12.2905 12.1157 12.4444 11.5 12.4444C10.8843 12.4444 10.3009 12.2905 9.75 11.9826C9.19907 11.6586 8.76968 11.2292 8.46181 10.6944C8.15393 10.1597 8 9.57639 8 8.94444ZM11.5 7C11.2569 7.0162 11.1273 7.14583 11.1111 7.38889V8.94444C11.1273 9.1875 11.2569 9.31713 11.5 9.33333H12.6667C12.9097 9.31713 13.0394 9.1875 13.0556 8.94444C13.0394 8.70139 12.9097 8.57176 12.6667 8.55556H11.8889V7.38889C11.8727 7.14583 11.7431 7.0162 11.5 7Z"
                        fill="#575859"
                      />
                    </svg>
                    <span className={styles.duration}>{tariff.duration}</span>
                  </div>
                </div>
                <span className={styles.tariffPrice}>
                  {tariff.price.toLocaleString()} ₽
                </span>
              </div>
              {tariff.features && tariff.features.length > 0 && (
                <div className={styles.featuresList}>
                  {tariff.features.map((feature, idx) => (
                    <div className={styles.featureItem} key={idx}>
                      {feature}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.rightBlock}>
                <span className={styles.rubTon}>RUB / TON</span>
                <span className={styles.payLink}>Оплатить</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.additionalOptions}>
        <h2>Дополнительные опции</h2>
        <div className={styles.optionsGrid}>
          {additionalOptions.map((option) => (
            <div key={option.id} className={styles.singleTariffCard}>
              <div className={styles.topRow}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <span className={styles.tariffName}>{option.name}</span>
                  <div className={styles.durationRow}>
                    <svg
                      width="15"
                      height="13"
                      viewBox="0 0 15 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.11111 0C4.46759 0.0324074 4.66204 0.226852 4.69444 0.583333V1.55556H8.19444V0.583333C8.22685 0.226852 8.4213 0.0324074 8.77778 0C9.13426 0.0324074 9.3287 0.226852 9.36111 0.583333V1.55556H10.3333C10.7708 1.57176 11.1354 1.72569 11.4271 2.01736C11.7188 2.30903 11.8727 2.67361 11.8889 3.11111V3.5V4.66667H11.5H2.16667V10.8889C2.18287 11.1319 2.3125 11.2616 2.55556 11.2778H7.92708C8.21875 11.7315 8.59144 12.1204 9.04514 12.4444H2.55556C2.11806 12.4282 1.75347 12.2743 1.46181 11.9826C1.17014 11.691 1.0162 11.3264 1 10.8889V4.66667V3.5V3.11111C1.0162 2.67361 1.17014 2.30903 1.46181 2.01736C1.75347 1.72569 2.11806 1.57176 2.55556 1.55556H3.52778V0.583333C3.56019 0.226852 3.75463 0.0324074 4.11111 0ZM8 8.94444C8 8.3125 8.15393 7.72917 8.46181 7.19444C8.76968 6.65972 9.19907 6.23032 9.75 5.90625C10.3009 5.59838 10.8843 5.44444 11.5 5.44444C12.1157 5.44444 12.6991 5.59838 13.25 5.90625C13.8009 6.23032 14.2303 6.65972 14.5382 7.19444C14.8461 7.72917 15 8.3125 15 8.94444C15 9.57639 14.8461 10.1597 14.5382 10.6944C14.2303 11.2292 13.8009 11.6586 13.25 11.9826C12.6991 12.2905 12.1157 12.4444 11.5 12.4444C10.8843 12.4444 10.3009 12.2905 9.75 11.9826C9.19907 11.6586 8.76968 11.2292 8.46181 10.6944C8.15393 10.1597 8 9.57639 8 8.94444ZM11.5 7C11.2569 7.0162 11.1273 7.14583 11.1111 7.38889V8.94444C11.1273 9.1875 11.2569 9.31713 11.5 9.33333H12.6667C12.9097 9.31713 13.0394 9.1875 13.0556 8.94444C13.0394 8.70139 12.9097 8.57176 12.6667 8.55556H11.8889V7.38889C11.8727 7.14583 11.7431 7.0162 11.5 7Z"
                        fill="#575859"
                      />
                    </svg>
                    <span className={styles.duration}>{option.duration}</span>
                  </div>
                </div>
                <span className={styles.tariffPrice}>
                  {option.price.toLocaleString()} ₽
                </span>
              </div>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>{option.description}</div>
              </div>
              <div className={styles.rightBlock}>
                <span className={styles.rubTon}>RUB / TON</span>
                <span className={styles.payLink}>Оплатить</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTariff && (
        <div className={styles.purchaseSection}>
          <button style={buttonStyle} onClick={handlePurchase}>
            Оплатить выбранный тариф
          </button>
        </div>
      )}
    </div>
  );
};

export default PremiumSubscription;
