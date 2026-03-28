import React, { useState, useContext } from 'react';
import axios from '../../../axios';
import { ThemeContext } from '../../../context/ThemeContext';
import s from '../Dashboard.module.sass';
import { toast } from 'sonner';
import { Camera, CheckCircle, Navigation, Package } from 'lucide-react';

export default function ActiveOrder({ order, onStatusChange }) {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [podFile, setPodFile] = useState(null);

  const isDark = theme === 'dark';

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await axios.patch(`/api/v1/driver/orders/${order._id}/status`, { status: newStatus });
      toast.success(`Статус обновлен: ${newStatus}`);
      onStatusChange();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Ошибка обновления статуса');
    } finally {
      setLoading(false);
    }
  };

  const handlePodUpload = async (e) => {
    e.preventDefault();
    if (!podFile) return;

    const formData = new FormData();
    formData.append('photos', podFile); // Changed to 'photos' as per spec

    setLoading(true);
    try {
      await axios.post(`/api/v1/driver/orders/${order._id}/pod`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Фотоотчет загружен! Рейс завершен.');
      onStatusChange(); 
    } catch (error) {
      console.error("Error uploading PoD:", error);
      toast.error('Ошибка загрузки фото');
    } finally {
      setLoading(false);
    }
  };

  const renderAction = () => {
    switch (order.status) {
      case 'ASSIGNED':
        return (
          <button 
            className={s.createButton} 
            style={{ width: '100%', height: 60, fontSize: 18, background: '#3b82f6' }}
            onClick={() => handleStatusUpdate('AT_PICKUP')}
            disabled={loading}
          >
            <Navigation size={24} style={{ marginRight: 8 }} />
            Выехал на погрузку
          </button>
        );
      case 'AT_PICKUP':
        return (
          <button 
            className={s.createButton} 
            style={{ width: '100%', height: 60, fontSize: 18, background: '#eab308' }}
            onClick={() => handleStatusUpdate('IN_TRANSIT')}
            disabled={loading}
          >
            <Package size={24} style={{ marginRight: 8 }} />
            Погрузка завершена, в путь
          </button>
        );
      case 'IN_TRANSIT':
        return (
          <button 
            className={s.createButton} 
            style={{ width: '100%', height: 60, fontSize: 18, background: '#22c55e' }}
            onClick={() => handleStatusUpdate('AT_DROP')}
            disabled={loading}
          >
            <CheckCircle size={24} style={{ marginRight: 8 }} />
            Прибыл на выгрузку
          </button>
        );
      case 'AT_DROP':
        return (
          <form onSubmit={handlePodUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 20, border: '2px dashed #ccc', borderRadius: 12, textAlign: 'center' }}>
              <input 
                type="file" 
                accept="image/*" 
                capture="camera"
                onChange={(e) => setPodFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="pod-upload"
              />
              <label htmlFor="pod-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Camera size={48} color="#888" />
                <span style={{ marginTop: 8, color: '#666' }}>
                  {podFile ? podFile.name : 'Нажмите, чтобы сделать фото (PoD)'}
                </span>
              </label>
            </div>
            <button 
              type="submit" 
              className={s.createButton} 
              style={{ width: '100%', height: 50, fontSize: 16 }}
              disabled={!podFile || loading}
            >
              Завершить рейс
            </button>
          </form>
        );
      default:
        return <p>Статус: {order.status}</p>;
    }
  };

  return (
    <div className={s.card}>
      <h3>Текущий рейс</h3>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{order.cargo?.description || order.description}</div>
        <div style={{ color: '#888' }}>{order.route?.from?.city || order.from} → {order.route?.to?.city || order.to}</div>
      </div>
      {renderAction()}
    </div>
  );
}
