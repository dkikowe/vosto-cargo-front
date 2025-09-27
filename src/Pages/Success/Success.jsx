import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./Success.module.sass";

const Success = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [selectedTariff, setSelectedTariff] = useState(null);

  useEffect(() => {
    // Получаем информацию о тарифе из localStorage
    const tariffData = localStorage.getItem("selectedTariff");
    if (tariffData) {
      setSelectedTariff(JSON.parse(tariffData));
      // Очищаем localStorage после получения данных
      localStorage.removeItem("selectedTariff");
    }
  }, []);

  const isDark = theme === "dark";

  const containerStyle = {
    backgroundColor: isDark ? "#121212" : "#fff",
    color: isDark ? "#fff" : "#000",
    minHeight: "100vh",
  };

  const background = isDark ? "#121212" : "#fff";
  const bgCard = isDark ? "#1e1e1e" : "#f8f9fa";

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.header} style={{ background: background }}>
        <ChevronLeft
          onClick={() => navigate("/menu")}
          style={{ cursor: "pointer", color: isDark ? "#fff" : "#000" }}
        />
        <h1>Оплата успешна</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.successCard} style={{ backgroundColor: bgCard }}>
          <CheckCircle
            size={80}
            color="#4CAF50"
            style={{ marginBottom: "20px" }}
          />

          <h2 style={{ color: isDark ? "#fff" : "#000", marginBottom: "16px" }}>
            Оплата прошла успешно!
          </h2>

          {selectedTariff && (
            <div style={{ marginBottom: "16px", width: "100%" }}>
              <div
                style={{
                  backgroundColor: isDark ? "#2a2a2a" : "#f0f9ff",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    color: isDark ? "#fff" : "#000",
                    fontSize: "20px",
                    fontWeight: "700",
                    margin: "0 0 8px 0",
                  }}
                >
                  {selectedTariff.name}
                </p>
                <p
                  style={{
                    color: isDark ? "#bbb" : "#666",
                    fontSize: "16px",
                    margin: "0 0 8px 0",
                  }}
                >
                  Срок действия: {selectedTariff.duration}
                </p>
                <p
                  style={{
                    color: "#4CAF50",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0",
                  }}
                >
                  {selectedTariff.price.toLocaleString()} ₽
                </p>
              </div>

              {selectedTariff.features &&
                selectedTariff.features.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <p
                      style={{
                        color: isDark ? "#fff" : "#000",
                        fontSize: "16px",
                        fontWeight: "600",
                        margin: "0 0 12px 0",
                      }}
                    >
                      Включено в подписку:
                    </p>
                    {selectedTariff.features.map((feature, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
                          ✓
                        </span>
                        <span
                          style={{
                            color: isDark ? "#fff" : "#000",
                            fontSize: "14px",
                          }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          <p
            style={{
              color: isDark ? "#bbb" : "#666",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Ваша премиум подписка активирована. Теперь у вас есть доступ ко всем
            функциям платформы.
          </p>

          {!selectedTariff && (
            <div className={styles.features}>
              <div className={styles.feature}>
                <span style={{ color: isDark ? "#fff" : "#000" }}>✓</span>
                <span style={{ color: isDark ? "#fff" : "#000" }}>
                  Неограниченное количество заявок
                </span>
              </div>
              <div className={styles.feature}>
                <span style={{ color: isDark ? "#fff" : "#000" }}>✓</span>
                <span style={{ color: isDark ? "#fff" : "#000" }}>
                  Полный доступ к платформе
                </span>
              </div>
              <div className={styles.feature}>
                <span style={{ color: isDark ? "#fff" : "#000" }}>✓</span>
                <span style={{ color: isDark ? "#fff" : "#000" }}>
                  Приоритетная поддержка
                </span>
              </div>
            </div>
          )}

          <button
            className={styles.backButton}
            onClick={() => navigate("/menu")}
            style={{
              backgroundColor: isDark ? "#356dbb" : "#2563eb",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              marginTop: "24px",
            }}
          >
            Вернуться в меню
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
