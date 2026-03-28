import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSocket } from "../../context/SocketContext";
import axios from "../../axios";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ position }) {
  const map = useMap();
  const hasCentered = React.useRef(false);
  useEffect(() => {
    if (position && !hasCentered.current) {
      // Zoom in closer (15) to see the 200m distance
      map.setView(position, 15, { animate: false });
      hasCentered.current = true;
    }
  }, [position, map]);
  return null;
}

export default function OrderMap({ orderId, style, className }) {
  const { socket } = useSocket();
  const [driverPosition, setDriverPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch from REST API (initial load only)
  useEffect(() => {
    const fetchLocation = async () => {
      if (!orderId) return;
      try {
        const { data } = await axios.get(`/api/v1/orders/${orderId}`);
        if (data.trackHistory && data.trackHistory.length > 0) {
          const lastPoint = data.trackHistory[data.trackHistory.length - 1];
          // Only set if not already set by socket
          setDriverPosition(prev => prev || [lastPoint.lat, lastPoint.lng]);
        } else {
          // Fallback to Astana
          setDriverPosition(prev => prev || [51.1282, 71.4304]);
        }
      } catch {
        setDriverPosition(prev => prev || [51.1282, 71.4304]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocation();
  }, [orderId]);

  // Real-time updates from WebSocket
  useEffect(() => {
    if (socket && orderId) {
      socket.emit("joinOrder", orderId);

      const handleDriverLocation = (data) => {
        const pos = [data.lat || data.latitude, data.lng || data.longitude];
        setDriverPosition(pos);
      };

      socket.on("driverLocation", handleDriverLocation);

      return () => {
        socket.off("driverLocation", handleDriverLocation);
      };
    }
  }, [socket, orderId]);

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>Загрузка карты...</div>;
  }

  if (!driverPosition) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>Ожидание местоположения водителя...</div>;
  }

  return (
    <MapContainer center={driverPosition} zoom={13} style={{ height: "300px", width: "100%", borderRadius: "12px", ...style }} className={className}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={driverPosition}>
        <Popup>Водитель здесь</Popup>
      </Marker>
      <MapUpdater position={driverPosition} />
    </MapContainer>
  );
}
