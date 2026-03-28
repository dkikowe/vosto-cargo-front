import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { Package, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./CustomerDashboard.module.scss";
import OrderCard from "../../components/Orders/OrderCard";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = localStorage.getItem("id");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Find active order (IN_TRANSIT)
  const activeOrder = orders.find((o) => o.status === "IN_TRANSIT");

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `/orders?role=CUSTOMER&userId=${userId}`,
      );
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}></header>

      {/* My Orders List */}
      <section>
        <h3 className={styles.sectionTitle}>Мои заказы</h3>

        {/* Active Order Section */}
        {activeOrder && (
          <div
            className={styles.activeOrderCard}
            onClick={() => navigate(`/orders/${activeOrder._id}`)}
          >
            <div className={styles.mapPlaceholder}>
              <div className={styles.pulsingMarker} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statusBadge}>🟢 В пути</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.emptyState}>Загрузка...</div>
        ) : orders.length === 0 && !activeOrder ? (
          <div className={styles.emptyState}>
            <Package size={48} strokeWidth={1.5} />
            <p>История заказов пуста</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders
              .filter((o) => o._id !== activeOrder?._id)
              .map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/orders/${order._id}`)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerDashboard;
