import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import s from "./Tracker.module.sass";
import { useTranslation } from "react-i18next";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import axios from "../../axios";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for the driver using a reliable SVG
const driverIcon = L.divIcon({
  html: `<div style="background: white; border: 2px solid #3390ec; border-radius: 50%; padding: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3390ec" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

function LocationMarker({ onLocated }) {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const { t } = useTranslation();
  const centeredUser = React.useRef(false);

  useEffect(() => {
    const onFound = (e) => {
      setPosition(e.latlng);
      if (onLocated) onLocated([e.latlng.lat, e.latlng.lng]);
      if (!centeredUser.current) {
        map.setView(e.latlng, 15, { animate: false });
        centeredUser.current = true;
      }
    };
    const onError = () => {
      if (!("geolocation" in navigator)) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          onFound({ latlng });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    };

    map.on("locationfound", onFound);
    map.on("locationerror", onError);
    map.locate({
      setView: false,
      enableHighAccuracy: true,
      watch: false,
      timeout: 20000,
      maximumAge: 0,
    });

    return () => {
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
      map.stopLocate();
    };
  }, [map, onLocated]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>{t("tracker.youAreHere") || "Вы здесь"}</Popup>
    </Marker>
  );
}

function DriverMarker({ orderId, orderData, userLatLng }) {
  const { socket } = useSocket();
  const [driverPosition, setDriverPosition] = useState(null);
  const map = useMap();
  const didFitBoth = React.useRef(false);
  const didCenterDriverSolo = React.useRef(false);

  // Fetch from REST API (initial load only)
  useEffect(() => {
    const fetchLocation = async () => {
      if (!orderId) return;
      try {
        const { data } = await axios.get(`/api/v1/orders/${orderId}`);
        if (data.trackHistory && data.trackHistory.length > 0) {
          const lastPoint = data.trackHistory[data.trackHistory.length - 1];
          const pos = [lastPoint.lat, lastPoint.lng];
          setDriverPosition(prev => prev || pos);
        }
      } catch {
        /* молча — трек может ещё не создаться */
      }
    };

    fetchLocation();
  }, [orderId]);

  // Один раз показать и вас, и водителя на одном экране (если оба известны)
  useEffect(() => {
    if (!driverPosition || !userLatLng || didFitBoth.current) return;
    didFitBoth.current = true;
    const b = L.latLngBounds([userLatLng, driverPosition]);
    map.fitBounds(b, { padding: [72, 72], maxZoom: 16, animate: false });
  }, [driverPosition, userLatLng, map]);

  // Если геолокации пользователя нет — один раз центрируем по водителю
  useEffect(() => {
    if (!driverPosition || userLatLng || didCenterDriverSolo.current) return;
    didCenterDriverSolo.current = true;
    map.setView(driverPosition, 15, { animate: false });
  }, [driverPosition, userLatLng, map]);

  // Real-time updates from WebSocket
  useEffect(() => {
    if (socket && orderId) {
      socket.emit("joinOrder", orderId);

      const handleDriverLocation = (data) => {
        // Handle both possible payload formats
        const pos = [data.lat || data.latitude, data.lng || data.longitude];
        if (pos[0] == null || pos[1] == null) return;
        setDriverPosition(pos);
      };

      socket.on("driverLocation", handleDriverLocation);

      return () => {
        socket.off("driverLocation", handleDriverLocation);
      };
    }
  }, [socket, orderId]);

  return driverPosition === null ? null : (
    <Marker position={driverPosition} icon={driverIcon}>
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>Водитель в пути</strong><br/>
          {orderData?.executor?.driver?.name && (
            <span>Водитель: {orderData.executor.driver.name}<br/></span>
          )}
          {orderData?.executor?.vehicle?.brand && (
            <span>Машина: {orderData.executor.vehicle.brand} ({orderData.executor.vehicle.plateNumber})<br/></span>
          )}
          {orderData?.executor?.logistician?.name && (
            <span style={{ fontSize: '11px', color: '#666' }}>Логист: {orderData.executor.logistician.name}</span>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function GoToMyLocation({ userLatLng, onUserPosition }) {
  const map = useMap();
  const [portalEl, setPortalEl] = useState(null);

  useEffect(() => {
    setPortalEl(map.getContainer());
  }, [map]);

  const handleClick = () => {
    if (userLatLng?.[0] != null && userLatLng?.[1] != null) {
      map.setView(userLatLng, 15, { animate: true });
      return;
    }
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        onUserPosition(ll);
        map.setView(ll, 15, { animate: true });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  if (!portalEl) return null;

  return createPortal(
    <div className={s.locateMeWrap}>
      <button
        type="button"
        className={s.locateMeBtn}
        onClick={handleClick}
        aria-label="Моё местоположение"
        title="Моё местоположение"
      >
        <Crosshair size={22} strokeWidth={2} />
      </button>
    </div>,
    portalEl
  );
}

export default function Tracker() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const userId = localStorage.getItem("id");
  const [isLocating, setIsLocating] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [userLatLng, setUserLatLng] = useState(null);

  useEffect(() => {
    // Fetch active order to track
    const fetchActiveOrder = async () => {
      if (!userId || !role) return;
      try {
        const { data } = await axios.get(`/orders?role=${role}&userId=${userId}`);
        const order = data.find(o => 
          ['AT_PICKUP', 'IN_TRANSIT', 'AT_DROP'].includes(o.status)
        );
        if (order) {
          setActiveOrder(order);
        }
      } catch {
        /* список заказов недоступен */
      }
    };
    fetchActiveOrder();
  }, [userId, role]);

  return (
    <div className={s.container}>
      <div className={s.overlay}>
        <div className={`${s.statusDot} ${!isLocating ? s.statusDotActive : ""}`} />
        <span className={s.statusText}>
            GPS Tracker Active
        </span>
      </div>
      
      {/* Info Panel if active order exists */}
      {activeOrder && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'var(--bg-card, #fff)',
          padding: '12px 20px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: '90%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #000)' }}>
            Активный рейс: {activeOrder.route?.from?.city || activeOrder.from} → {activeOrder.route?.to?.city || activeOrder.to}
          </div>
          {activeOrder.executor?.logistician?.name && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
              Логист: {activeOrder.executor.logistician.name}
            </div>
          )}
          {activeOrder.executor?.vehicle?.brand && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
              Машина: {activeOrder.executor.vehicle.brand} ({activeOrder.executor.vehicle.plateNumber})
            </div>
          )}
        </div>
      )}
      
      <MapContainer
        center={[51.1282, 71.4304]} /* Астана до прихода геолокации */
        zoom={13}
        className={s.mapContainer}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker
          onLocated={(ll) => {
            setUserLatLng(ll);
            setIsLocating(false);
          }}
        />
        {activeOrder && (
          <DriverMarker
            orderId={activeOrder._id}
            orderData={activeOrder}
            userLatLng={userLatLng}
          />
        )}
        <GoToMyLocation
          userLatLng={userLatLng}
          onUserPosition={(ll) => {
            setUserLatLng(ll);
            setIsLocating(false);
          }}
        />
      </MapContainer>
    </div>
  );
}
