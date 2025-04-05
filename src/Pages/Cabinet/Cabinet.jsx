import React, { useContext, useEffect, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useNavigate } from "react-router-dom";
import axios from "../../axios"; // <-- Подключаем ваш настроенный axios (с baseURL = "http://localhost:3001" или другой)
import {
  Star,
  Headset,
  ChevronRight,
  Building2,
  SunMoon,
  Settings,
  LockKeyhole,
  Bell,
  Calculator,
} from "lucide-react";
import s from "./Cabinet.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import RoleSelect from "../../components/RoleSelect/RoleSelect";

export default function Cabinet() {
  // Если используете Telegram WebApp, раскомментируйте это и закомментируйте initData ниже
  const initData = window.Telegram.WebApp.initData;
  // const initData =
  // "user=%7B%22id%22%3A5056024242%2C%22first_name%22%3A%22%3C%5C%2Fabeke%3E%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22abylaikak%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAj3hfrbNq8PfLLKvsSp3-WizcXTc3HO8Vynsw3R1a1A5spK3fDmZERABNoOGLEQN.svg%22%7D&chat_instance=-4908992446394523843&chat_type=private&auth_date=1735556539&signature=pgNJfzcxYGAcJCJ_jnsYEsmiTJJxOP2tNKb941-fT7QcsUQ2chSkFcItG8KvjR_r3nH0vem4bxtlltuyX-IwBQ&hash=c0b510163f5b1dea53172644df35e63458216a9d5d9a10413af4f5b0204bb493";

  const navigate = useNavigate();
  const id = localStorage.getItem("id");

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [idTelega, setIdTelega] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  // Управление видимостью попапа «Калькулятор»
  const [showCalculator, setShowCalculator] = useState(false);

  // Тема из контекста
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Инициализация данных из Telegram
  useEffect(() => {
    try {
      if (initData) {
        const params = new URLSearchParams(initData);
        const userData = params.get("user");

        if (userData) {
          const userObj = JSON.parse(decodeURIComponent(userData));
          console.log(userObj);
          if (!userObj.id) {
            alert("Не удалось получить Telegram ID");
            return;
          }

          axios
            .post("/getTelegramId", {
              initData: userObj.id,
              img: userObj.photo_url,
              name: userObj.username ? userObj.username : userObj.first_name,
            })
            .then((response) => {
              if (response.data?.user?._id) {
                localStorage.setItem("id", response.data.user._id);
              }
            })
            .catch((error) => {
              console.error("Ошибка при отправке данных:", error);
              alert("Произошла ошибка");
            });
        }
      }
    } catch (error) {
      console.error("Ошибка при разборе initData:", error);
    }
  }, [initData]);

  // Загрузка данных пользователя
  useEffect(() => {
    if (id) {
      axios.get(`/getUserById/${id}`).then((res) => {
        if (res.data) {
          setUser(res.data);
          setName(res.data.name || "Ваше имя");
          setRole(res.data.role);
          setIdTelega(res.data.telegramId);
          setCompany(res.data.company);
          if (res.data.theme) {
            localStorage.setItem("theme", res.data.theme);
          }
          setIsLoading(false);
        }
      });
    }
  }, [id]);

  // Загрузка информации о компании
  useEffect(() => {
    if (id) {
      axios
        .get(`/getCompany/${id}`)
        .then((res) => {
          if (res.data && res.data.company) {
            console.log(res.data.company);
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении данных компании:", error);
        });
    }
  }, [id]);

  function handleNavigate(path) {
    navigate(`/${path}`);
  }

  const saveName = () => {
    axios
      .post("/saveName", { userId: id, name })
      .then((res) => res.data)
      .then((data) => {
        if (data) {
          alert("Успешно изменено имя");
        }
      })
      .catch((err) => {
        console.log(err.message);
        alert("Не удалось изменить имя");
      });
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleSaveAvatar = async () => {
    if (!editor) return;
    setIsLoading(true);
    const canvas = editor.getImageScaledToCanvas();
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("photo", blob, "avatar.png");
      try {
        const response = await axios.post(`/uploadPhoto/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Upload successful:", response.data);
        setUser((prev) => ({ ...prev, avatar: URL.createObjectURL(blob) }));
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setIsLoading(false);
        setSelectedFile(null);
      }
    });
  };

  // ======================= Калькулятор через БЭКЕНД =======================
  function CalculatorPopup({ onClose }) {
    const [cityA, setCityA] = useState("");
    const [cityB, setCityB] = useState("");
    const [rate, setRate] = useState("");
    const [distance, setDistance] = useState(0);
    const [price, setPrice] = useState(0);

    async function handleCalculate() {
      if (!cityA || !cityB || !rate) return;
      try {
        // Предполагаем, что на бэкенде есть маршрут:
        //   GET /api/distance?cityA=...&cityB=...
        // который возвращает данные в том же формате, что и Google Distance Matrix
        // (или хотя бы { rows: [ { elements: [ { distance: { value: 1234 } } ] } ] })

        // Делаем запрос через axios (baseURL настроен в ../../axios)
        // Допустим, /api/distance ведёт к http://localhost:3001/api/distance
        const response = await axios.get(
          `/api/distance?cityA=${encodeURIComponent(
            cityA
          )}&cityB=${encodeURIComponent(cityB)}`
        );

        const data = response.data;
        // Путь к значению дистанции в метрах
        const distMeters = data?.rows?.[0]?.elements?.[0]?.distance?.value;
        if (!distMeters) {
          throw new Error("Не удалось получить расстояние от бэкенда");
        }

        const distKm = distMeters / 1000;
        setDistance(distKm);

        // Формула: руб/км = ставка / пройденные км
        setPrice(Number(rate) / distKm);
      } catch (error) {
        console.error(error);
      }
    }

    return (
      <div className={`${s.overlay} ${theme === "dark" ? s.dark : s.light}`}>
        <div className={s.popupCalculator}>
          <button className={s.closeBtn} onClick={onClose}>
            ×
          </button>
          <h2 className={s.title}>Калькулятор цены за км</h2>

          <div className={s.field}>
            <label>Город A</label>
            <input
              type="text"
              value={cityA}
              onChange={(e) => setCityA(e.target.value)}
              placeholder="Введите город отправления"
            />
          </div>

          <div className={s.field}>
            <label>Город B</label>
            <input
              type="text"
              value={cityB}
              onChange={(e) => setCityB(e.target.value)}
              placeholder="Введите город назначения"
            />
          </div>

          <div className={s.field}>
            <label>Ставка (₽)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Укажите ставку"
            />
          </div>

          <button className={s.calculateBtn} onClick={handleCalculate}>
            Рассчитать
          </button>

          <div className={s.result}>
            <p>Расстояние: {distance ? `${distance.toFixed(2)} км` : "-"}</p>
            <p>Цена за км: {price ? `${price.toFixed(2)} руб.` : "-"}</p>
          </div>
        </div>
      </div>
    );
  }
  // =======================================================================

  return (
    <div className={`${s.container} ${theme === "dark" ? s.dark : s.light}`}>
      {/* Верхняя часть профиля */}
      <div className={s.profileContainer}>
        <div className={s.profile}>
          <label htmlFor="image" className="w-[97px] relative">
            {selectedFile ? (
              <div className={s.overlay}>
                <div className={s.editorContainer}>
                  <AvatarEditor
                    ref={(ref) => setEditor(ref)}
                    image={selectedFile}
                    width={97}
                    height={97}
                    border={50}
                    borderRadius={50}
                    scale={scale}
                    className={s.divAvatar}
                  />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                  />
                  <button onClick={handleSaveAvatar} className={s.saveButton}>
                    Сохранить
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={user?.avatar || "/images/nav-icons/user.svg"}
                  className={`${s.profileIcon} ${
                    avatarLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  alt=""
                  onLoad={() => setAvatarLoaded(true)}
                />
                <img
                  className="absolute right-[30px] bottom-0"
                  src="/images/cabinet-icons/photo.svg"
                  alt=""
                />
                <input
                  type="file"
                  hidden
                  id="image"
                  onChange={handleFileSelection}
                  accept=".png, .jpg"
                />
              </>
            )}
          </label>
          <div className={s.desc}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={s.name}
              onBlur={saveName}
            />
            <RoleSelect userId={id} />
            <p className={s.idTelega}>Ваш ID: {idTelega}</p>
          </div>
        </div>
        <hr />
        <div className={s.company} onClick={() => handleNavigate("company")}>
          <div className={s.icon}>
            <Building2 />
            <p className={s.companyText}>
              {company && company.name ? company.name : "Добавить компанию"}
            </p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      <div className={s.paymentContainer}>
        <div className={s.support} onClick={() => setShowCalculator(true)}>
          <div className={s.iconText}>
            <Calculator />
            <p>Калькулятор </p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      {/* Блок с подпиской и поддержкой */}
      <div className={s.paymentContainer}>
        <div className={s.premium}>
          <div className={s.iconText}>
            <Star />
            <p>Подписка</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
        <hr />
        <div className={s.support}>
          <div className={s.iconText}>
            <Headset />
            <p>Поддержка</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      {/* Переключатель темы */}
      <div className={s.themeChanger}>
        <div className={s.change}>
          <div className={s.iconText}>
            <SunMoon />
            <p>{theme === "dark" ? "Тёмная тема" : "Светлая тема"}</p>
          </div>
          <div className={s.themeToggle}>
            <label className={s.switch}>
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className={s.slider}></span>
            </label>
          </div>
        </div>
      </div>

      {/* Уведомления, конфиденциальность, настройки */}
      <div className={s.paymentContainer}>
        <div className={s.support}>
          <div className={s.iconText}>
            <Bell />
            <p>Уведомления</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
        <hr />
        <div className={s.support}>
          <div className={s.iconText}>
            <LockKeyhole />
            <p>Конфеденциальность</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
        <hr />
        <div className={s.support}>
          <div className={s.iconText}>
            <Settings />
            <p>Настройки приложения</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      {/* Кнопка, открывающая калькулятор (через бэкенд) */}

      {/* Popup для калькулятора */}
      {showCalculator && (
        <CalculatorPopup onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
}
