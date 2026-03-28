import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axios";
import { ThemeContext } from "../../context/ThemeContext";
import s from "./OrderDetails.module.scss";
import { ArrowLeft, MapPin, Package, Calendar, Truck, User, CheckCircle, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import OrderMap from "../../components/Map/OrderMap";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user, role } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Try both endpoints just in case, or stick to one. 
        // Based on previous context, /orders is often used for lists, maybe /orders/:id works too?
        // Or /api/v1/orders/:id
        const { data } = await axios.get(`/api/v1/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Не удалось загрузить заказ");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    try {
      await axios.post(`/api/v1/orders/${id}/bids/${bidId}/accept`);
      toast.success("Предложение принято!");
      // Refresh order
      const { data } = await axios.get(`/api/v1/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error("Error accepting bid:", error);
      toast.error("Ошибка при принятии предложения");
    }
  };

  if (loading) return <div className={s.loading}>Загрузка...</div>;
  if (!order) return <div className={s.error}>Заказ не найден</div>;

  const isCustomer = role === "CUSTOMER";
  const isLogistician = role === "LOGISTICIAN";

  return (
    <div className={s.container}>
      <header className={s.header}>
        <button onClick={() => navigate(-1)} className={s.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <h1>Детали заказа</h1>
      </header>

      <div className={s.content}>
        {/* Route Info */}
        <div className={s.card}>
          <div className={s.routeHeader}>
            <div className={s.city}>
              <span className={s.label}>Откуда</span>
              <h3>{order.route?.from?.city || order.from}</h3>
            </div>
            <div className={s.divider}></div>
            <div className={s.city}>
              <span className={s.label}>Куда</span>
              <h3>{order.route?.to?.city || order.to}</h3>
            </div>
          </div>
          <div className={s.meta}>
            <div className={s.metaItem}>
              <Calendar size={16} />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={s.metaItem}>
              <span className={s.statusBadge} data-status={order.status}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Cargo Info */}
        <div className={s.card}>
          <h3>Груз</h3>
          <div className={s.infoGrid}>
            <div className={s.infoItem}>
              <span className={s.label}>Описание</span>
              <p>{order.cargoDetails?.description || order.description || "—"}</p>
            </div>
            <div className={s.infoItem}>
              <span className={s.label}>Вес</span>
              <p>{order.cargoDetails?.weight || order.weight || "—"} кг</p>
            </div>
            <div className={s.infoItem}>
              <span className={s.label}>Объем</span>
              <p>{order.cargoDetails?.volume || order.volume || "—"} м³</p>
            </div>
            <div className={s.infoItem}>
              <span className={s.label}>Цена заказчика</span>
              <p className={s.price}>{order.pricing?.customerOffer || order.price || "—"} ₽</p>
            </div>
          </div>
        </div>

        {/* Bids Section (Visible to Customer) */}
        {isCustomer && (order.status === "PUBLISHED" || order.status === "NEGOTIATION") && (
          <div className={s.bidsSection}>
            <h3>Предложения ({order.bids?.length || 0})</h3>
            
            {(!order.bids || order.bids.length === 0) ? (
              <p className={s.emptyBids}>Пока нет предложений от логистов</p>
            ) : (
              <div className={s.bidsList}>
                {order.bids.map((bid) => (
                  <div key={bid._id} className={s.bidCard}>
                    <div className={s.bidHeader}>
                      <div className={s.bidderInfo}>
                        <User size={20} />
                        <span>{bid.logistician?.name || "Логист"}</span>
                      </div>
                      <span className={s.bidAmount}>{bid.amount} ₽</span>
                    </div>
                    {bid.comment && <p className={s.bidComment}>{bid.comment}</p>}
                    <button 
                      className={s.acceptBtn}
                      onClick={() => handleAcceptBid(bid._id)}
                    >
                      Принять
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Executor Info (If Approved/Assigned) */}
        {order.executor && (
          <div className={s.card}>
            <h3>Исполнитель</h3>
            <div className={s.executorInfo}>
              <div className={s.infoRow}>
                <span className={s.label}>Логист:</span>
                <span>{order.executor.logistician?.name}</span>
              </div>
              {order.executor.logistician?.phone && (
                <div className={s.infoRow}>
                  <span className={s.label}>Телефон:</span>
                  <a href={`tel:${order.executor.logistician.phone}`}>{order.executor.logistician.phone}</a>
                </div>
              )}
              
              {order.executor.vehicle && (
                <div className={s.vehicleInfo}>
                  <h4>Машина</h4>
                  <p>{order.executor.vehicle.brand} ({order.executor.vehicle.plateNumber})</p>
                </div>
              )}
              
              {order.executor.driver && (
                <div className={s.driverInfo}>
                  <h4>Водитель</h4>
                  <p>{order.executor.driver.name}</p>
                  {order.executor.driver.phone && (
                    <a href={`tel:${order.executor.driver.phone}`}>{order.executor.driver.phone}</a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Tracking (Visible if IN_TRANSIT) */}
        {['AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(order.status) && (
          <div className={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Navigation size={20} color="#3390ec" />
              <h3 style={{ margin: 0 }}>Отслеживание на карте</h3>
            </div>
            <OrderMap orderId={order._id} />
          </div>
        )}
      </div>
    </div>
  );
}
