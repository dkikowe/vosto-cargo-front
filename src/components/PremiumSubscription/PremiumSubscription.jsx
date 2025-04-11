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
      id: "weekly",
      name: t("premium.tariffs.weekly.name"),
      duration: t("premium.tariffs.weekly.duration"),
      price: 1000,
      features: [
        t("premium.tariffs.weekly.feature1"),
        t("premium.tariffs.weekly.feature2"),
      ],
    },
    {
      id: "monthly",
      name: t("premium.tariffs.monthly.name"),
      duration: t("premium.tariffs.monthly.duration"),
      price: 3990,
      features: [
        t("premium.tariffs.monthly.feature1"),
        t("premium.tariffs.monthly.feature2"),
      ],
    },
    {
      id: "half-year",
      name: t("premium.tariffs.halfYear.name"),
      duration: t("premium.tariffs.halfYear.duration"),
      price: 7990,
      features: [
        t("premium.tariffs.halfYear.feature1"),
        t("premium.tariffs.halfYear.feature2"),
        t("premium.tariffs.halfYear.feature3"),
      ],
    },
    {
      id: "yearly",
      name: t("premium.tariffs.yearly.name"),
      duration: t("premium.tariffs.yearly.duration"),
      price: 10990,
      features: [
        t("premium.tariffs.yearly.feature1"),
        t("premium.tariffs.yearly.feature2"),
        t("premium.tariffs.yearly.feature3"),
      ],
    },
  ];

  const additionalOptions = [
    {
      id: "contacts",
      name: t("premium.options.contacts.name"),
      price: 590,
      duration: t("premium.options.contacts.duration"),
      description: t("premium.options.contacts.description"),
    },
    {
      id: "all-cars",
      name: t("premium.options.allCars.name"),
      price: 490,
      duration: t("premium.options.allCars.duration"),
      description: t("premium.options.allCars.description"),
    },
    {
      id: "ratings",
      name: t("premium.options.ratings.name"),
      price: 1990,
      duration: t("premium.options.ratings.duration"),
      description: t("premium.options.ratings.description"),
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
        <h1>{t("premium.title")}</h1>
      </div>

      <div className={styles.tariffs}>
        <h2>{t("premium.tariffsTitle")}</h2>
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
        <h2>{t("premium.optionsTitle")}</h2>
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
              <button style={buttonStyle}>{t("premium.buy")}</button>
            </div>
          ))}
        </div>
      </div>

      {selectedTariff && (
        <div className={styles.purchaseSection}>
          <button style={buttonStyle} onClick={handlePurchase}>
            {t("premium.buySelected")}
          </button>
        </div>
      )}
    </div>
  );
};

export default PremiumSubscription;
