import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';
import { toast } from 'sonner';
import { Package, Camera, Navigation, CheckCircle2, Truck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import styles from './DriverDashboard.module.scss';
import OrderCard from '../../components/Orders/OrderCard';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const userId = localStorage.getItem('id');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const watchIdRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/orders?role=DRIVER&userId=${userId}`);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error('Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId]);

  // Find active order (not DELIVERED and not just PUBLISHED/NEGOTIATION unless assigned)
  // For driver, active orders are usually APPROVED, AT_PICKUP, IN_TRANSIT, AT_DROP
  const activeOrder = orders.find(o => 
    ['ASSIGNED', 'APPROVED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
  );

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/v1/driver/orders/${orderId}/status`, { status: newStatus });
      toast.success('Статус успешно обновлен');
      fetchOrders(); // Refresh to get updated status
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleFinishTrip = async () => {
    if (!activeOrder) return;
    if (!photoFile) {
      toast.error('Пожалуйста, загрузите фото подтверждения (PoD)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photos', photoFile);

      await axios.post(`/api/v1/driver/orders/${activeOrder._id}/pod`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Рейс успешно завершен!');
      setPhoto(null);
      setPhotoFile(null);
      setIsGpsActive(false); // Turn off GPS when trip is done
      fetchOrders();
    } catch (error) {
      console.error("Error finishing trip:", error);
      toast.error('Ошибка при завершении рейса');
    }
  };

  // Mock GPS tracking for testing without moving
  const [mockInterval, setMockInterval] = useState(null);
  const [mockCoords, setMockCoords] = useState(null); // To show on UI

  // Join order room just in case backend requires it for broadcasting
  useEffect(() => {
    if (socket && isConnected && activeOrder) {
      socket.emit('joinOrder', activeOrder._id);
    }
  }, [socket, isConnected, activeOrder]);

  const startMockGps = () => {
    if (!activeOrder || !socket || !isConnected) {
      toast.error('Нет подключения к серверу или активного заказа');
      return;
    }
    
    setIsGpsActive(true);
    toast.success('Поиск вашей геопозиции для старта...');
    
    const startSimulation = (targetLat, targetLng) => {
      toast.success('Симуляция начата! Водитель в 200м от вас.');
      // Start ~200 meters away (approx 0.002 degrees)
      let currentLat = targetLat + 0.002;
      let currentLng = targetLng + 0.002;
      
      const interval = setInterval(() => {
        // Move towards target smoothly
        if (currentLat > targetLat) currentLat -= 0.0001;
        if (currentLng > targetLng) currentLng -= 0.0001;
        if (currentLat < targetLat) currentLat += 0.0001;
        if (currentLng < targetLng) currentLng += 0.0001;
        
        socket.emit('updateLocation', {
          driverId: userId,
          orderId: activeOrder._id,
          lat: currentLat,
          lng: currentLng
        });
        setMockCoords({ lat: currentLat, lng: currentLng });
      }, 2000); // Send every 2 seconds
      
      setMockInterval(interval);
    };

    // Try to get actual user location to start 200m from there
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => startSimulation(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.error("Geo error:", err);
          startSimulation(51.1282, 71.4304); // Fallback to Astana
        },
        { timeout: 5000 }
      );
    } else {
      startSimulation(51.1282, 71.4304); // Fallback to Astana
    }
  };

  const stopMockGps = () => {
    if (mockInterval) {
      clearInterval(mockInterval);
      setMockInterval(null);
      setMockCoords(null);
    }
    setIsGpsActive(false);
    toast.info('Симуляция остановлена');
  };

  // Real GPS Tracking Logic
  useEffect(() => {
    // Skip real GPS if mock is running
    if (mockInterval) return;

    if (isGpsActive && activeOrder && socket && isConnected) {
      if (!navigator.geolocation) {
        toast.error('Геолокация не поддерживается вашим браузером');
        setIsGpsActive(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('updateLocation', {
            driverId: userId,
            orderId: activeOrder._id,
            lat: latitude,
            lng: longitude
          });
        },
        (error) => {
          console.error("Error watching position:", error);
          toast.error('Ошибка получения геолокации');
          setIsGpsActive(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mockInterval) {
        clearInterval(mockInterval);
      }
    };
  }, [isGpsActive, activeOrder, socket, isConnected, userId, mockInterval]);

  const toggleGps = () => {
    if (!activeOrder) {
      toast.error('Нет активного заказа для трансляции геопозиции');
      return;
    }
    
    if (mockInterval) {
      stopMockGps();
      return;
    }
    
    setIsGpsActive(!isGpsActive);
  };

  const renderActionButton = (order) => {
    switch (order.status) {
      case 'ASSIGNED':
      case 'APPROVED':
        return (
          <button 
            className={`${styles.statusButton} ${styles.atPickup}`}
            onClick={(e) => { e.stopPropagation(); handleStatusChange(order._id, 'AT_PICKUP'); }}
          >
            <MapPin size={20} /> Прибыл на погрузку
          </button>
        );
      case 'AT_PICKUP':
        return (
          <button 
            className={`${styles.statusButton} ${styles.inTransit}`}
            onClick={(e) => { 
              e.stopPropagation(); 
              handleStatusChange(order._id, 'IN_TRANSIT'); 
              setIsGpsActive(true); // Auto-start GPS when in transit
            }}
          >
            <Truck size={20} /> Начать рейс (В пути)
          </button>
        );
      case 'IN_TRANSIT':
        return (
          <button 
            className={`${styles.statusButton} ${styles.atDrop}`}
            onClick={(e) => { e.stopPropagation(); handleStatusChange(order._id, 'AT_DROP'); }}
          >
            <MapPin size={20} /> Прибыл на выгрузку
          </button>
        );
      case 'AT_DROP':
        return (
          <div className={styles.podSection} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cameraUpload}>
              {photo ? (
                <img src={photo} alt="PoD" />
              ) : (
                <div className={styles.cameraPlaceholder}>
                  <Camera size={40} />
                  <span>Загрузить фотоотчет (PoD)</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handlePhotoUpload}
              />
            </div>
            <button 
              className={`${styles.statusButton} ${styles.delivered}`}
              onClick={handleFinishTrip}
            >
              <CheckCircle2 size={20} /> Завершить рейс
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Панель водителя</h1>
      </header>

      {/* GPS Toggle (visible only if there's an active order) */}
      {activeOrder && (
        <div className={styles.gpsToggle}>
          <div className={styles.gpsInfo}>
            <div className={`${styles.gpsIcon} ${!isGpsActive ? styles.inactive : ''}`}>
              <Navigation size={24} />
            </div>
            <div className={styles.gpsText}>
              <span>GPS Трансляция</span>
              <span>{isGpsActive ? 'Геопозиция передается' : 'Трансляция выключена'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Test button for mock GPS */}
            {!isGpsActive && (
              <button 
                onClick={startMockGps}
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: '#3390ec', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Тест GPS
              </button>
            )}
            <label className={styles.switch}>
              <input type="checkbox" checked={isGpsActive} onChange={toggleGps} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      )}

      {/* Show mock coords if active */}
      {mockCoords && (
        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', textAlign: 'center' }}>
          Симуляция: {mockCoords.lat.toFixed(5)}, {mockCoords.lng.toFixed(5)}
        </div>
      )}

      {/* Active Order Section */}
      {activeOrder && (
        <section>
          <h3 className={styles.sectionTitle}>Текущий рейс</h3>
          <div style={{ marginBottom: '32px' }}>
            <OrderCard 
              order={activeOrder} 
              onClick={() => navigate(`/orders/${activeOrder._id}`)}
            />
            <div style={{ marginTop: '16px' }}>
              {renderActionButton(activeOrder)}
            </div>
          </div>
        </section>
      )}

      {/* My Orders List */}
      <section>
        <h3 className={styles.sectionTitle}>Все заказы</h3>

        {loading ? (
          <div className={styles.emptyState}>Загрузка...</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} strokeWidth={1.5} />
            <p>У вас пока нет назначенных заказов</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders
              .filter(o => o._id !== activeOrder?._id)
              .map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  actionButton={renderActionButton(order)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DriverDashboard;
