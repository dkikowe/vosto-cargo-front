import React, { useEffect, useState, useContext } from "react";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import styles from "./CustomerDashboard.module.scss"; 
import { Search, Briefcase, Package, User, Truck, Phone } from "lucide-react";
import OrderCard from "../../components/Orders/OrderCard";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import BottomSheetModal from "../Create/components/BottomSheetModal";

export default function LogisticianDashboard() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'my_orders'
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const userId = localStorage.getItem("id");

  // Bidding State
  const [bidAmount, setBidAmount] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [selectedOrderForBid, setSelectedOrderForBid] = useState(null);

  // Assignment State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [myFleet, setMyFleet] = useState([]);
  const [myDrivers, setMyDrivers] = useState([]); // Assuming drivers are separate or linked to vehicles
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const fetchMarketplace = async () => {
    try {
      const { data } = await axios.get('/orders?status=PUBLISHED');
      if (Array.isArray(data)) setOrders(data);
      else if (data && Array.isArray(data.orders)) setOrders(data.orders);
      else setOrders([]);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get(`/orders?executorId=${userId}`); 
      if (Array.isArray(data)) setMyOrders(data);
      else if (data && Array.isArray(data.orders)) setMyOrders(data.orders);
      else setMyOrders([]);
    } catch (error) {
      console.error("Error fetching my orders:", error);
    }
  };

  const fetchFleetAndDrivers = async () => {
    try {
      const [fleetRes, driversRes] = await Promise.all([
        axios.get(`/api/v1/fleet/vehicles?ownerId=${userId}`),
        // Assuming there's an endpoint for drivers, or we get them from fleet
        // For now, let's assume we might need a drivers endpoint or just use fleet
        axios.get(`/api/v1/fleet/drivers?ownerId=${userId}`).catch(() => ({ data: [] })) 
      ]);
      setMyFleet(Array.isArray(fleetRes.data) ? fleetRes.data : []);
      setMyDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
    } catch (error) {
      console.error("Error fetching fleet/drivers:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMarketplace(), fetchMyOrders(), fetchFleetAndDrivers()]).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const nav = document.getElementById('main-nav');
    if (nav) {
      if (isAssignModalOpen) {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (nav) nav.style.display = 'flex';
    };
  }, [isAssignModalOpen]);

  const handlePlaceBid = async (orderId) => {
    if (!bidAmount) return;
    try {
      await axios.post(`/api/v1/orders/${orderId}/bids`, {
        logisticianId: userId,
        amount: Number(bidAmount),
        comment: bidComment
      });
      toast.success('Ставка сделана!');
      setSelectedOrderForBid(null);
      setBidAmount('');
      setBidComment('');
      fetchMarketplace(); 
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error('Ошибка при создании ставки');
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrderForAssign(order);
    setIsAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedVehicleId) {
      toast.error("Выберите машину");
      return;
    }

    try {
      await axios.patch(`/api/v1/orders/${selectedOrderForAssign._id}/assign`, {
        vehicleId: selectedVehicleId
      });
      toast.success("Машина назначена!");
      setIsAssignModalOpen(false);
      fetchMyOrders();
    } catch (error) {
      console.error("Error assigning:", error);
      toast.error("Ошибка назначения");
    }
  };

  const renderBidForm = (orderId) => (
    <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.03)', borderRadius: 12 }}>
      <input 
        placeholder="Ваша цена (₽)" 
        type="number"
        value={bidAmount} 
        onChange={e => setBidAmount(e.target.value)}
        className={styles.input}
        onClick={e => e.stopPropagation()}
      />
      <input 
        placeholder="Комментарий" 
        value={bidComment} 
        onChange={e => setBidComment(e.target.value)}
        className={styles.input}
        style={{ marginTop: 8 }}
        onClick={e => e.stopPropagation()}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handlePlaceBid(orderId);
          }}
          className={styles.primaryBtn}
        >
          Отправить
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrderForBid(null);
          }}
          className={styles.secondaryBtn}
        >
          Отмена
        </button>
      </div>
    </div>
  );

  const renderOrderActions = (order) => {
    if (order.status === 'APPROVED') {
      return (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            openAssignModal(order);
          }}
          className={styles.actionBtn}
          style={{ marginTop: 12, width: '100%', background: '#22c55e' }}
        >
          Назначить машину
        </button>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Кабинет Логиста</h1>
        <button 
          className={styles.createButton} 
          onClick={() => navigate("/fleet")}
          aria-label="Мой автопарк"
        >
          <Truck size={24} />
        </button>
      </header>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          onClick={() => setActiveTab('search')}
          className={`${styles.tab} ${activeTab === 'search' ? styles.active : ''}`}
        >
          <Search size={18} />
          Биржа
        </button>
        <button 
          onClick={() => setActiveTab('my_orders')}
          className={`${styles.tab} ${activeTab === 'my_orders' ? styles.active : ''}`}
        >
          <Briefcase size={18} />
          В работе
        </button>
      </div>

      <div className={styles.ordersList}>
        {loading ? (
          <div className={styles.emptyState}>Загрузка...</div>
        ) : (
          <>
            {activeTab === 'search' && (
              <>
                {orders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Package size={48} strokeWidth={1.5} />
                    <p>Нет доступных грузов</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <OrderCard 
                      key={order._id} 
                      order={order} 
                      actionButton={
                        selectedOrderForBid === order._id ? renderBidForm(order._id) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderForBid(order._id);
                            }}
                            className={styles.actionBtn}
                            style={{ marginTop: 12, width: '100%' }}
                          >
                            Сделать ставку
                          </button>
                        )
                      }
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'my_orders' && (
              <>
                {myOrders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Package size={48} strokeWidth={1.5} />
                    <p>У вас нет активных заказов</p>
                  </div>
                ) : (
                  myOrders.map(order => (
                    <OrderCard 
                      key={order._id} 
                      order={order} 
                      onClick={() => navigate(`/orders/${order._id}`)}
                      actionButton={renderOrderActions(order)}
                    />
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>

      <BottomSheetModal visible={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
        <div className={styles.modalContent}>
          <h2>Назначение на рейс</h2>
          <p className={styles.modalSubtitle}>
            {selectedOrderForAssign?.route?.from?.city} → {selectedOrderForAssign?.route?.to?.city}
          </p>

          <div className={styles.formGroup}>
            <label>Выберите машину</label>
            <select 
              value={selectedVehicleId} 
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className={styles.select}
            >
              <option value="">Не выбрано</option>
              {myFleet
                .filter(v => v.currentDriver) // Только машины с назначенным водителем
                .map(v => (
                  <option key={v._id} value={v._id}>
                    {v.brand} ({v.plateNumber}) — Водитель: {v.currentDriver.name}
                  </option>
              ))}
            </select>
          </div>

          <button onClick={handleAssign} className={styles.submitBtn}>
            Назначить
          </button>
        </div>
      </BottomSheetModal>
    </div>
  );
}
