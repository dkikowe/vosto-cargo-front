import React, { useEffect, useState, useContext } from "react";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import s from "./Dashboard.module.sass";
import { ArrowLeft } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/logistician/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Dashboard access error:", error);
        if (error.response && error.response.status === 403) {
          alert("Доступ запрещен. Только для логистов.");
          navigate("/home");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        color: isDark ? "#fff" : "#000",
        minHeight: "100vh",
        background: isDark ? "#121212" : "#f5f5f5"
      }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div className={`${s.container} ${isDark ? s.dark : s.light}`}>
      <div className={s.header}>
        <button onClick={() => navigate("/menu")} className={s.backBtn}>
          <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
        </button>
        <h1>Админ-панель логиста</h1>
      </div>
      
      <div className={s.content}>
        {data ? (
          <div className={s.dashboardData}>
            <div className={s.card}>
              <h3>Активные заказы</h3>
              <p className={s.stat}>{data.activeOrdersCount || 0}</p>
            </div>
            <div className={s.card}>
              <h3>Водителей на линии</h3>
              <p className={s.stat}>{data.activeDriversCount || 0}</p>
            </div>
            {/* Add more dashboard widgets here based on API response */}
            <div className={s.infoBlock}>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <p>Нет данных для отображения</p>
        )}
      </div>
    </div>
  );
}
