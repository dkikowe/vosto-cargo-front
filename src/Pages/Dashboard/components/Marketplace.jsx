import React, { useState, useEffect, useContext } from 'react';
import axios from '../../../axios';
import { ThemeContext } from '../../../context/ThemeContext';
import s from '../Dashboard.module.sass';
import { toast } from 'sonner';
import { Truck, User } from 'lucide-react';

export default function Marketplace() {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'my_orders'
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bidding State
  const [bidAmount, setBidAmount] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Assignment State
  const [myFleet, setMyFleet] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const userId = localStorage.getItem('id');
  const isDark = theme === 'dark';

  const fetchMarketplace = async () => {
    try {
      // Логист видит только PUBLISHED заказы для торгов
      const { data } = await axios.get('/orders?status=PUBLISHED');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
    }
  };

  const fetchMyOrders = async () => {
    try {
      // Заказы, где логист выиграл (APPROVED) или уже работает (ASSIGNED, IN_TRANSIT)
      // Предполагаем, что бэкенд фильтрует по executorId или logisticianId
      const { data } = await axios.get(`/orders?executorId=${userId}`); 
      setMyOrders(data);
    } catch (error) {
      console.error("Error fetching my orders:", error);
    }
  };

  const fetchMyFleet = async () => {
    try {
      const { data } = await axios.get(`/api/v1/fleet/vehicles?ownerId=${userId}`);
      setMyFleet(data);
    } catch (error) {
      console.error("Error fetching fleet:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMarketplace(), fetchMyOrders(), fetchMyFleet()]).finally(() => setLoading(false));
  }, [userId]);

  const handlePlaceBid = async (orderId) => {
    if (!bidAmount) return;
    try {
      await axios.post(`/api/v1/orders/${orderId}/bids`, {
        logisticianId: userId,
        amount: Number(bidAmount),
        comment: bidComment
      });
      toast.success('Ставка сделана! Статус заказа изменен на NEGOTIATION');
      setSelectedOrder(null);
      setBidAmount('');
      setBidComment('');
      fetchMarketplace(); 
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error('Ошибка при создании ставки');
    }
  };

  const handleAssignExecution = async (orderId) => {
    if (!selectedVehicle) return;
    
    const vehicle = myFleet.find(v => v._id === selectedVehicle);
    if (!vehicle || !vehicle.driver) {
        toast.error("У выбранной машины нет водителя");
        return;
    }

    try {
      await axios.patch(`/api/v1/orders/${orderId}/assign`, {
        vehicleId: selectedVehicle,
        driverId: vehicle.driver._id || vehicle.driver // Assuming driver object or ID
      });
      toast.success('Машина назначена! Статус ASSIGNED');
      fetchMyOrders();
    } catch (error) {
      console.error("Error assigning execution:", error);
      toast.error('Ошибка назначения');
    }
  };

  return (
    <div className={s.card}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, borderBottom: '1px solid #eee' }}>
        <button 
            onClick={() => setActiveTab('search')}
            style={{ 
                padding: '8px 0', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'search' ? '2px solid #3a5c9f' : 'none',
                fontWeight: activeTab === 'search' ? 600 : 400,
                cursor: 'pointer',
                color: isDark ? '#fff' : '#000'
            }}
        >
            Поиск грузов
        </button>
        <button 
            onClick={() => setActiveTab('my_orders')}
            style={{ 
                padding: '8px 0', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'my_orders' ? '2px solid #3a5c9f' : 'none',
                fontWeight: activeTab === 'my_orders' ? 600 : 400,
                cursor: 'pointer',
                color: isDark ? '#fff' : '#000'
            }}
        >
            Мои заказы
        </button>
      </div>

      {loading ? <p>Загрузка...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* SEARCH TAB */}
          {activeTab === 'search' && (
              <>
                {orders.length === 0 && <p style={{ color: '#888' }}>Нет доступных грузов</p>}
                {orders.map(order => (
                    <div key={order._id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{order.cargo?.description || order.description}</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>
                            {order.pricing?.customerOffer || order.price} ₽
                        </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                        {order.route?.from?.city || order.from} → {order.route?.to?.city || order.to}
                    </div>
                    
                    {selectedOrder === order._id ? (
                        <div style={{ marginTop: 8, padding: 8, background: isDark ? '#2a2a2a' : '#f0f9ff', borderRadius: 6 }}>
                        <input 
                            className={s.input} 
                            placeholder="Ваша цена" 
                            type="number"
                            value={bidAmount} 
                            onChange={e => setBidAmount(e.target.value)}
                            style={{ marginBottom: 8 }}
                        />
                        <input 
                            className={s.input} 
                            placeholder="Комментарий (например: Готов завтра)" 
                            value={bidComment} 
                            onChange={e => setBidComment(e.target.value)}
                            style={{ marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                            className={s.createButton} 
                            onClick={() => handlePlaceBid(order._id)}
                            style={{ flex: 1, justifyContent: 'center' }}
                            >
                            Отправить ставку
                            </button>
                            <button 
                            className={s.backBtn} 
                            onClick={() => setSelectedOrder(null)}
                            style={{ flex: 1, border: '1px solid #ccc' }}
                            >
                            Отмена
                            </button>
                        </div>
                        </div>
                    ) : (
                        <button 
                        className={s.createButton} 
                        onClick={() => setSelectedOrder(order._id)}
                        style={{ width: '100%', justifyContent: 'center', marginTop: 8, background: '#3b82f6' }}
                        >
                        Сделать ставку
                        </button>
                    )}
                    </div>
                ))}
              </>
          )}

          {/* MY ORDERS TAB */}
          {activeTab === 'my_orders' && (
              <>
                {myOrders.length === 0 && <p style={{ color: '#888' }}>У вас нет активных заказов</p>}
                {myOrders.map(order => (
                    <div key={order._id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{order.cargo?.description || order.description}</span>
                            <span style={{ 
                                fontSize: 12, 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                background: order.status === 'APPROVED' ? '#dcfce7' : '#f3f4f6',
                                color: order.status === 'APPROVED' ? '#166534' : '#374151'
                            }}>
                                {order.status}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                            {order.route?.from?.city || order.from} → {order.route?.to?.city || order.to}
                        </div>

                        {order.status === 'APPROVED' && (
                            <div style={{ padding: 8, background: isDark ? '#2a2a2a' : '#fff7ed', borderRadius: 6 }}>
                                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Назначить машину и водителя:</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <select 
                                        className={s.input} 
                                        style={{ flex: 1 }}
                                        onChange={(e) => setSelectedVehicle(e.target.value)}
                                        value={selectedVehicle}
                                    >
                                        <option value="">Выберите машину</option>
                                        {myFleet.map(v => (
                                            <option key={v._id} value={v._id}>
                                                {v.brand} {v.plateNumber} ({v.driver ? v.driver.name : 'Без водителя'})
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        className={s.createButton} 
                                        onClick={() => handleAssignExecution(order._id)}
                                        disabled={!selectedVehicle}
                                    >
                                        Назначить
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(order.status) && (
                            <div style={{ fontSize: 13, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Truck size={14} /> В работе у водителя
                            </div>
                        )}
                    </div>
                ))}
              </>
          )}

        </div>
      )}
    </div>
  );
}
