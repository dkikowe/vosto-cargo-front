import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import styles from "./PremiumSubscription.module.scss";
import { ChevronLeft } from "lucide-react";

const PremiumSubscription = () => {
  const [selectedTariff, setSelectedTariff] = useState(null);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const isDark = theme === "dark";

  const tariffs = [
    {
      id: "weekly",
      name: "РАЗОВЫЙ",
      duration: "1 неделя",
      price: 1000,
      features: [
        "Открытие 30 заявок в день",
        "Просмотр 10 резюме без размещения вакансии",
      ],
    },
    {
      id: "monthly",
      name: "МИНИМАЛЬНЫЙ",
      duration: "1 месяц",
      price: 3990,
      features: ["Полный доступ", "Неограниченное количество заявок"],
    },
    {
      id: "half-year",
      name: "СТАНДАРТ",
      duration: "6 месяцев",
      price: 7990,
      features: [
        "Полный доступ",
        "Неограниченное количество заявок",
        "Скидка 33%",
      ],
    },
    {
      id: "yearly",
      name: "МАКСИМАЛЬНЫЙ",
      duration: "12 месяцев",
      price: 10990,
      features: [
        "Полный доступ",
        "Неограниченное количество заявок",
        "Скидка 50%",
      ],
    },
  ];

  const additionalOptions = [
    {
      id: "contacts",
      name: "Дополнительный контакт",
      price: 590,
      duration: "25 дней",
      description: "10 открытий заявок",
    },
    {
      id: "all-cars",
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
          style={{
            cursor: "pointer",
            color: isDark ? "#fff" : "#000",
          }}
        />
        <h1>Премиум подписка</h1>
      </div>

      <div className={styles.tariffs}>
        <h2>Тарифы для перевозчиков</h2>
        <div className={styles.tariffGrid}>
          {tariffs.map((tariff) => (
            <div
              key={tariff.id}
              className={`${styles.tariffCard} ${
                selectedTariff === tariff.id ? styles.selected : ""
              }`}
              style={cardStyle}
              onClick={() => handleTariffSelect(tariff.id)}
            >
              <h3>{tariff.name}</h3>
              <p className={styles.duration}>{tariff.duration}</p>
              <p className={styles.price}>{tariff.price} ₽</p>
              <ul className={styles.features}>
                {tariff.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.additionalOptions}>
        <h2>Дополнительные опции</h2>
        <div className={styles.optionsGrid}>
          {additionalOptions.map((option) => (
            <div
              key={option.id}
              className={styles.optionCard}
              style={cardStyle}
            >
              <h3>{option.name}</h3>
              <p className={styles.price}>{option.price} ₽</p>
              <p className={styles.duration}>{option.duration}</p>
              <p className={styles.description}>{option.description}</p>
              <button style={buttonStyle}>Купить</button>
            </div>
          ))}
        </div>
      </div>

      {selectedTariff && (
        <div className={styles.purchaseSection}>
          <button style={buttonStyle} onClick={handlePurchase}>
            Купить выбранный тариф
          </button>
        </div>
      )}
    </div>
  );
};

export default PremiumSubscription;
