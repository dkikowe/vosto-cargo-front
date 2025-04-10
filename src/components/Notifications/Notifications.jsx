import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import styles from "./Notifications.module.scss";
import axios from "../../axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const Notifications = () => {
  const { theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (!userId) return;

    const fetchUserAndBuildNotifications = async () => {
      try {
        const { data: user } = await axios.get(`/getUserById/${userId}`);
        if (!user?.ratingHistory) return;

        const generated = user.ratingHistory.map((entry, index) => ({
          id: entry._id || index,
          title: "Вам поставили рейтинг",
          message: `${entry.value} звёзд — ${
            entry.reason || "без комментария"
          }`,
          time: dayjs(entry.createdAt).fromNow(),
          type: "rating",
        }));

        setNotifications(generated);
      } catch (error) {
        console.error("Ошибка при загрузке уведомлений:", error);
      }
    };

    fetchUserAndBuildNotifications();
  }, []);

  const background = isDarkMode ? "#121212" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#222";
  const messageColor = isDarkMode ? "#ccc" : "#444";
  const timeColor = isDarkMode ? "#888" : "#888";
  const cardBg = isDarkMode ? "#1e1e1e" : "#f9f9f9";

  return (
    <div
      className={styles.notifications}
      style={{ backgroundColor: background, color: textColor }}
    >
      <div className={styles.header} style={{ color: textColor }}>
        <ChevronLeft
          onClick={() => navigate("/menu")}
          style={{
            cursor: "pointer",
            color: textColor,
          }}
        />
        <h1>Уведомления</h1>
      </div>
      <div className={styles.notificationsList}>
        {notifications.length === 0 && (
          <p className={styles.empty} style={{ color: timeColor }}>
            Нет новых уведомлений
          </p>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.notification} ${styles[notification.type]}`}
            style={{ backgroundColor: cardBg, color: textColor }}
          >
            <div className={styles.notificationContent}>
              <h3 className={styles.notificationTitle}>{notification.title}</h3>
              <p
                className={styles.notificationMessage}
                style={{ color: messageColor }}
              >
                {notification.message}
              </p>
              <span
                className={styles.notificationTime}
                style={{ color: timeColor }}
              >
                {notification.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
