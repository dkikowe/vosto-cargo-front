import React, { useState, useEffect, useContext } from 'react';
import axios from '../../../axios';
import { ThemeContext } from '../../../context/ThemeContext';
import s from '../Dashboard.module.sass';
import { Truck, User, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FleetManager() {
  const { theme } = useContext(ThemeContext);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const userId = localStorage.getItem('id'); // ID Логиста

  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    brand: '',
    type: 'TRUCK_20T',
    weight: '',
    volume: ''
  });

  const isDark = theme === 'dark';

  const fetchFleet = async () => {
    try {
      const { data } = await axios.get(`/api/v1/fleet/vehicles?ownerId=${userId}`);
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching fleet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      // Получаем всех пользователей с ролью DRIVER (в реальном приложении может быть фильтр по компании)
      const { data } = await axios.get('/users?role=DRIVER');
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFleet();
      fetchDrivers();
    }
  }, [userId]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ownerId: userId,
        plateNumber: newVehicle.plateNumber,
        brand: newVehicle.brand,
        type: newVehicle.type,
        capacity: {
          weight: Number(newVehicle.weight),
          volume: Number(newVehicle.volume)
        }
      };

      await axios.post('/api/v1/fleet/vehicles', payload);
      toast.success('Машина добавлена');
      setShowAddForm(false);
      setNewVehicle({ plateNumber: '', brand: '', type: 'TRUCK_20T', weight: '', volume: '' });
      fetchFleet();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error('Ошибка при добавлении машины');
    }
  };

  const handleAssignDriver = async (vehicleId, driverId) => {
    try {
      await axios.post(`/api/v1/fleet/vehicles/assign-driver`, { 
        vehicleId, 
        driverId 
      });
      toast.success('Водитель закреплен');
      fetchFleet();
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error('Ошибка назначения водителя');
    }
  };

  return (
    <div className={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Мой автопарк</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={s.createButton}
          style={{ padding: '8px', borderRadius: '50%', width: 32, height: 32, justifyContent: 'center' }}
        >
          <Plus size={20} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVehicle} style={{ marginBottom: 16, padding: 12, background: isDark ? '#2a2a2a' : '#f0f9ff', borderRadius: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input 
              placeholder="Марка (Volvo)" 
              className={s.input} 
              value={newVehicle.brand} 
              onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} 
              required
            />
            <input 
              placeholder="Госномер (A777AA77)" 
              className={s.input} 
              value={newVehicle.plateNumber} 
              onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})} 
              required
            />
            <select 
              className={s.input}
              value={newVehicle.type}
              onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
            >
              <option value="TRUCK_20T">Фура 20т</option>
              <option value="TRUCK_10T">Грузовик 10т</option>
              <option value="TRUCK_5T">Грузовик 5т</option>
              <option value="REF">Рефрижератор</option>
              <option value="VAN">Газель/Вэн</option>
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
                <input 
                placeholder="Вес (кг)" 
                type="number"
                className={s.input} 
                value={newVehicle.weight} 
                onChange={e => setNewVehicle({...newVehicle, weight: e.target.value})} 
                required
                />
                <input 
                placeholder="Объем (м3)" 
                type="number"
                className={s.input} 
                value={newVehicle.volume} 
                onChange={e => setNewVehicle({...newVehicle, volume: e.target.value})} 
                required
                />
            </div>
          </div>
          <button type="submit" className={s.createButton} style={{ width: '100%', justifyContent: 'center' }}>Добавить</button>
        </form>
      )}

      {loading ? <p>Загрузка...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vehicles.map(vehicle => (
            <div key={vehicle._id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={16} /> {vehicle.brand} {vehicle.plateNumber}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {vehicle.type} • {vehicle.capacity?.weight}кг • {vehicle.capacity?.volume}м³
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {vehicle.driver ? (
                  <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 12 }}>
                    <User size={12} /> {vehicle.driver.name || 'Водитель'}
                  </div>
                ) : (
                  <select 
                    className={s.input} 
                    style={{ padding: '4px 8px', fontSize: 12, width: 120 }}
                    onChange={(e) => handleAssignDriver(vehicle._id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Назначить</option>
                    {drivers.map(d => (
                      <option key={d._id} value={d._id}>{d.name || d.email || d._id}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && <p style={{ color: '#888', fontSize: 13, textAlign: 'center' }}>Нет машин в парке</p>}
        </div>
      )}
    </div>
  );
}
