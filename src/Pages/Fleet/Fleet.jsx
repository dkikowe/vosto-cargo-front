import React, { useState, useEffect, useContext } from "react";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import s from "./Fleet.module.scss";
import { 
  Truck, 
  Plus, 
  Trash2, 
  User, 
  Settings, 
  ArrowLeft,
  Phone,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import BottomSheetModal from "../Create/components/BottomSheetModal";

export default function Fleet() {
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'drivers'
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const userId = localStorage.getItem("id");

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: "",
    type: "TRUCK_20T",
    brand: "",
    weight: "",
    volume: ""
  });

  // Driver Search State
  const [searchTelegramId, setSearchTelegramId] = useState("");
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [foundDriver, setFoundDriver] = useState(null);

  const vehicleTypes = [
    { value: "TRUCK_20T", label: "Фура 20т" },
    { value: "TRUCK_10T", label: "Грузовик 10т" },
    { value: "TRUCK_5T", label: "Грузовик 5т" },
    { value: "REF", label: "Рефрижератор" },
    { value: "VAN", label: "Фургон" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        axios.get(`/api/v1/fleet/vehicles?ownerId=${userId}`).catch(() => ({ data: [] })),
        axios.get(`/api/v1/fleet/drivers?logisticianId=${userId}`).catch(() => ({ data: [] }))
      ]);
      
      console.log("Полученные машины:", vehiclesRes.data);
      console.log("Полученные водители логиста:", driversRes.data); // ВЫВОД В КОНСОЛЬ
      
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
      setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
    } catch (error) {
      console.error("Error fetching fleet data:", error);
      // toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // --- Handlers for Vehicles ---

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async () => {
    if (!vehicleForm.plateNumber || !vehicleForm.brand || !vehicleForm.weight) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      await axios.post("/api/v1/fleet/vehicles", {
        ownerId: userId,
        plateNumber: vehicleForm.plateNumber,
        type: vehicleForm.type,
        brand: vehicleForm.brand,
        capacity: {
          weight: Number(vehicleForm.weight),
          volume: Number(vehicleForm.volume)
        }
      });
      toast.success("Машина добавлена!");
      setIsVehicleModalOpen(false);
      setVehicleForm({ plateNumber: "", type: "TRUCK_20T", brand: "", weight: "", volume: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Ошибка при добавлении");
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Удалить машину?")) return;
    try {
      await axios.delete(`/api/v1/fleet/vehicles/${id}`);
      toast.success("Машина удалена");
      fetchData();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // --- Handlers for Drivers ---

  const handleSearchDriver = async () => {
    if (!searchTelegramId) {
      toast.error("Введите Telegram ID");
      return;
    }
    
    setIsSearchingDriver(true);
    setFoundDriver(null);
    
    try {
      const { data } = await axios.get(`/api/v1/users/telegram/${searchTelegramId}`);
      console.log("Результат поиска водителя:", data); // ВЫВОД В КОНСОЛЬ
      if (data) {
        setFoundDriver(data);
      } else {
        toast.error("Водитель не найден");
      }
    } catch (error) {
      console.error("Error searching driver:", error);
      toast.error("Водитель не найден");
    } finally {
      setIsSearchingDriver(false);
    }
  };

  const handleAddDriver = async () => {
    if (!foundDriver) return;

    const payload = {
      logisticianId: userId,
      telegramId: foundDriver.telegramId
    };

    console.log("Отправка данных для добавления водителя:", payload); // ЛОГИРОВАНИЕ ПЕРЕД ОТПРАВКОЙ

    try {
      await axios.post("/api/v1/fleet/drivers", payload);
      toast.success("Водитель добавлен!");
      setIsDriverModalOpen(false);
      setSearchTelegramId("");
      setFoundDriver(null);
      fetchData();
    } catch (error) {
      console.error("Error adding driver:", error);
      toast.error("Ошибка при добавлении водителя");
    }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm("Удалить водителя?")) return;
    try {
      await axios.delete(`/api/v1/fleet/drivers/${id}`);
      toast.success("Водитель удален");
      fetchData();
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  };

  // --- Assignment Logic ---

  const openAssignModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsAssignModalOpen(true);
  };

  const handleAssignDriver = async (driverId) => {
    try {
      await axios.post(`/api/v1/fleet/vehicles/assign-driver`, {
        vehicleId: selectedVehicle._id,
        driverId: driverId
      });
      toast.success("Водитель назначен!");
      setIsAssignModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error("Ошибка назначения");
    }
  };

  const handleUnassignDriver = async (vehicle) => {
    if (!window.confirm(`Снять водителя с машины ${vehicle.brand}?`)) return;
    try {
      // Assuming unassign is sending null or there's a specific endpoint.
      // If there's a specific endpoint for unassigning, it should be used here.
      // For now, I'll send null as driverId to the assign endpoint, or you can update if there's an unassign endpoint.
      await axios.post(`/api/v1/fleet/vehicles/assign-driver`, {
        vehicleId: vehicle._id,
        driverId: null
      });
      toast.success("Водитель снят");
      fetchData();
    } catch (error) {
      console.error("Error unassigning driver:", error);
      toast.error("Ошибка при снятии водителя");
    }
  };

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.headerTop}>
          <button onClick={() => navigate(-1)} className={s.backBtn}>
            <ArrowLeft size={24} />
          </button>
          <h1>Мой автопарк</h1>
          <button 
            className={s.addBtn} 
            onClick={() => activeTab === 'vehicles' ? setIsVehicleModalOpen(true) : setIsDriverModalOpen(true)}
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div className={s.tabs}>
          <button 
            className={`${s.tab} ${activeTab === 'vehicles' ? s.activeTab : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            Машины
          </button>
          <button 
            className={`${s.tab} ${activeTab === 'drivers' ? s.activeTab : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            Водители
          </button>
        </div>
      </header>

      <div className={s.content}>
        {loading ? (
          <div className={s.emptyState}>Загрузка...</div>
        ) : (
          <>
            {/* VEHICLES TAB */}
            {activeTab === 'vehicles' && (
              vehicles.length === 0 ? (
                <div className={s.emptyState}>
                  <Truck size={48} strokeWidth={1.5} />
                  <p>В вашем парке пока нет машин</p>
                  <button className={s.primaryBtn} onClick={() => setIsVehicleModalOpen(true)}>
                    Добавить машину
                  </button>
                </div>
              ) : (
                <div className={s.grid}>
                  {vehicles.map((vehicle) => {
                    return (
                      <div key={vehicle._id} className={s.card}>
                        <div className={s.cardHeader}>
                          <div className={s.iconBox}>
                            <Truck size={20} />
                          </div>
                          <div className={s.vehicleInfo}>
                            <h3>{vehicle.brand}</h3>
                            <span className={s.plate}>{vehicle.plateNumber}</span>
                          </div>
                          <button className={s.deleteBtn} onClick={() => handleDeleteVehicle(vehicle._id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className={s.specs}>
                          <div className={s.specItem}>
                            <span>Тип</span>
                            <strong>{vehicleTypes.find(t => t.value === vehicle.type)?.label || vehicle.type}</strong>
                          </div>
                          <div className={s.specItem}>
                            <span>Г/П</span>
                            <strong>{vehicle.capacity?.weight / 1000} т</strong>
                          </div>
                          <div className={s.specItem}>
                            <span>Объем</span>
                            <strong>{vehicle.capacity?.volume} м³</strong>
                          </div>
                        </div>

                        <div className={s.driverSection}>
                          {vehicle.currentDriver ? (
                            <div className={s.assignedDriver}>
                              <div className={s.driverInfo}>
                                <User size={16} />
                                <span>{vehicle.currentDriver.name}</span>
                              </div>
                              <button 
                                className={s.unassignBtn}
                                onClick={() => openAssignModal(vehicle)}
                              >
                                Изменить
                              </button>
                            </div>
                          ) : (
                            <button 
                              className={s.assignBtn}
                              onClick={() => openAssignModal(vehicle)}
                            >
                              <Plus size={16} />
                              Назначить водителя
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* DRIVERS TAB */}
            {activeTab === 'drivers' && (
              drivers.length === 0 ? (
                <div className={s.emptyState}>
                  <User size={48} strokeWidth={1.5} />
                  <p>Список водителей пуст</p>
                  <button className={s.primaryBtn} onClick={() => setIsDriverModalOpen(true)}>
                    Добавить водителя
                  </button>
                </div>
              ) : (
                <div className={s.grid}>
                  {drivers.map((driver) => (
                    <div key={driver._id} className={s.card}>
                      <div className={s.cardHeader}>
                        <div className={s.iconBox} style={{ background: 'transparent', padding: 0 }}>
                          {driver.avatar ? (
                            <img 
                              src={driver.avatar} 
                              alt="avatar" 
                              style={{ width: 40, height: 40, borderRadius: '12px', objectFit: 'cover' }} 
                            />
                          ) : (
                            <div style={{ 
                              width: 40, height: 40, borderRadius: '12px', 
                              background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <User size={20} />
                            </div>
                          )}
                        </div>
                        <div className={s.vehicleInfo}>
                          <h3>{driver.name}</h3>
                          <div className={s.phoneRow}>
                            <MessageCircle size={12} />
                            <span>{driver.telegramId || "Нет ID"}</span>
                          </div>
                        </div>
                        <button className={s.deleteBtn} onClick={() => handleDeleteDriver(driver._id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {driver.licenseNumber && (
                        <div className={s.specs} style={{ border: 'none', paddingTop: 0 }}>
                          <div className={s.specItem}>
                            <span>В/У</span>
                            <strong>{driver.licenseNumber}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* ADD VEHICLE MODAL */}
      <BottomSheetModal visible={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)}>
        <div className={s.modalContent}>
          <h2>Добавить машину</h2>
          
          <div className={s.formGroup}>
            <label>Марка и модель</label>
            <input 
              name="brand" 
              placeholder="Volvo FH" 
              value={vehicleForm.brand} 
              onChange={handleVehicleChange} 
            />
          </div>

          <div className={s.formGroup}>
            <label>Гос. номер</label>
            <input 
              name="plateNumber" 
              placeholder="A 777 AA 777" 
              value={vehicleForm.plateNumber} 
              onChange={handleVehicleChange} 
            />
          </div>

          <div className={s.formGroup}>
            <label>Тип кузова</label>
            <select name="type" value={vehicleForm.type} onChange={handleVehicleChange}>
              {vehicleTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className={s.row}>
            <div className={s.formGroup}>
              <label>Вес (кг)</label>
              <input 
                name="weight" 
                type="number" 
                placeholder="20000" 
                value={vehicleForm.weight} 
                onChange={handleVehicleChange} 
              />
            </div>
            <div className={s.formGroup}>
              <label>Объем (м³)</label>
              <input 
                name="volume" 
                type="number" 
                placeholder="82" 
                value={vehicleForm.volume} 
                onChange={handleVehicleChange} 
              />
            </div>
          </div>

          <button className={s.submitBtn} onClick={handleAddVehicle}>
            Сохранить
          </button>
        </div>
      </BottomSheetModal>

      {/* ADD DRIVER MODAL */}
      <BottomSheetModal 
        visible={isDriverModalOpen} 
        onClose={() => {
          setIsDriverModalOpen(false);
          setFoundDriver(null);
          setSearchTelegramId("");
        }}
      >
        <div className={s.modalContent}>
          <h2>Добавить водителя</h2>
          
          <div className={s.searchRow}>
            <input 
              placeholder="Telegram ID" 
              value={searchTelegramId} 
              onChange={(e) => setSearchTelegramId(e.target.value)} 
            />
            <button 
              className={s.searchBtn} 
              onClick={handleSearchDriver}
              disabled={isSearchingDriver}
            >
              {isSearchingDriver ? "..." : "Поиск"}
            </button>
          </div>

          {foundDriver && (
            <div className={s.foundDriverCard}>
              <div className={s.driverInfo}>
                {foundDriver.avatar ? (
                  <img src={foundDriver.avatar} alt="avatar" className={s.avatar} />
                ) : (
                  <div className={s.avatarPlaceholder}>
                    <User size={24} />
                  </div>
                )}
                <div className={s.details}>
                  <h4>{foundDriver.name}</h4>
                  <p>Статус: {foundDriver.driverStatus === 'FREE' ? 'Свободен' : 'Занят'}</p>
                </div>
              </div>
              <button className={s.submitBtn} onClick={handleAddDriver}>
                Добавить в автопарк
              </button>
            </div>
          )}
        </div>
      </BottomSheetModal>

      {/* ASSIGN DRIVER MODAL */}
      <BottomSheetModal visible={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
        <div className={s.modalContent}>
          <h2>Назначить водителя</h2>
          <p style={{ color: '#999', marginBottom: 20, textAlign: 'center' }}>
            Для машины {selectedVehicle?.brand} ({selectedVehicle?.plateNumber})
          </p>
          
          <div className={s.driversList}>
            {drivers.filter(d => !vehicles.find(v => v.currentDriver?._id === d._id && v._id !== selectedVehicle?._id)).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>Нет свободных водителей</p>
            ) : (
              drivers
                .filter(d => !vehicles.find(v => v.currentDriver?._id === d._id && v._id !== selectedVehicle?._id)) // Filter out drivers assigned to OTHER vehicles
                .map(driver => (
                  <div 
                    key={driver._id} 
                    className={s.driverOption}
                    onClick={() => handleAssignDriver(driver._id)}
                  >
                    <div className={s.driverOptionInfo}>
                      <span className={s.name}>{driver.name}</span>
                      <span className={s.phone}>{driver.phone}</span>
                    </div>
                    <div className={s.selectCircle}></div>
                  </div>
                ))
            )}
          </div>
        </div>
      </BottomSheetModal>
    </div>
  );
}
