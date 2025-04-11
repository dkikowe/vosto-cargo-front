import React, { use, useContext, useEffect, useState } from "react";
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
  Languages,
} from "lucide-react";
import s from "./Cabinet.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import RoleSelect from "../../components/RoleSelect/RoleSelect";
import { useTranslation } from "react-i18next";

// ...импорты остаются без изменений...

export default function Cabinet() {
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
  const [rating, setRating] = useState("");

  const [showCalculator, setShowCalculator] = useState(false);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    try {
      if (initData) {
        const params = new URLSearchParams(initData);
        const userData = params.get("user");

        if (userData) {
          const userObj = JSON.parse(decodeURIComponent(userData));
          if (!userObj.id) {
            alert(t("cabinet.tgIdFail"));
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
            .catch(() => {
              alert(t("cabinet.sendError"));
            });
        }
      }
    } catch (error) {
      console.error("Ошибка при разборе initData:", error);
    }
  }, [initData]);

  useEffect(() => {
    if (id) {
      axios.get(`/getUserById/${id}`).then((res) => {
        if (res.data) {
          console.log(res.data);
          setUser(res.data);
          setName(res.data.name || t("cabinet.defaultName"));
          setRole(res.data.role);
          setIdTelega(res.data.telegramId);
          setCompany(res.data.company);
          setRating(res.data.rating);
          if (res.data.theme) localStorage.setItem("theme", res.data.theme);
          if (res.data.language) i18n.changeLanguage(res.data.language);
          setIsLoading(false);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      axios
        .get(`/getCompany/${id}`)
        .then((res) => {
          if (res.data && res.data.company) {
            console.log(res.data.company);
          }
        })
        .catch(console.error);
    }
  }, [id]);

  const handleNavigate = (path) => navigate(`/${path}`);

  const saveName = () => {
    axios
      .post("/saveName", { userId: id, name })
      .then((res) => res.data)
      .then((data) => {
        if (data) alert(t("cabinet.nameChangeSuccess"));
      })
      .catch(() => alert(t("cabinet.nameChangeFail")));
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
        setUser((prev) => ({ ...prev, avatar: URL.createObjectURL(blob) }));
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setIsLoading(false);
        setSelectedFile(null);
      }
    });
  };

  function CalculatorPopup({ onClose }) {
    const [cityA, setCityA] = useState("");
    const [cityB, setCityB] = useState("");
    const [carType, setCarType] = useState("тент");
    const [cargoType, setCargoType] = useState("full");
    const [volume, setVolume] = useState("");
    const [weight, setWeight] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleCalculate() {
      setError(null);
      setResult(null);

      if (!cityA || !cityB || !carType) return;

      if (cargoType === "groupage" && (!volume || !weight)) {
        setError(t("calculator.error"));
        return;
      }

      try {
        setLoading(true);
        const params = { cityA, cityB, carType, cargoType };
        if (cargoType === "groupage") {
          params.volume = volume;
          params.weight = weight;
        }
        const res = await axios.get("/getShippingCalculation", { params });
        setResult(res.data);
      } catch (err) {
        console.error("Ошибка при расчете:", err);
        setError(t("calculator.serverError"));
      } finally {
        setLoading(false);
      }
    }

    return (
      <div className={`${s.overlay} ${theme === "dark" ? s.dark : s.light}`}>
        <div className={s.popupCalculator}>
          <button className={s.closeBtn} onClick={onClose}>
            ×
          </button>
          <h2 className={s.title}>{t("calculator.title")}</h2>

          <div className={s.field}>
            <label>{t("calculator.cityFrom")}</label>
            <input
              type="text"
              value={cityA}
              onChange={(e) => setCityA(e.target.value)}
              placeholder={t("calculator.placeholderFrom")}
            />
          </div>

          <div className={s.field}>
            <label>{t("calculator.cityTo")}</label>
            <input
              type="text"
              value={cityB}
              onChange={(e) => setCityB(e.target.value)}
              placeholder={t("calculator.placeholderTo")}
            />
          </div>

          <div className={s.selects}>
            <div className={s.field}>
              <label>{t("calculator.carType")}</label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className={s.select}
              >
                <option value="тент">{t("calculator.tent")}</option>
                <option value="рефрижератор">
                  {t("calculator.refrigerator")}
                </option>
              </select>
            </div>

            <div className={s.field}>
              <label>{t("calculator.cargoType")}</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className={s.select}
              >
                <option value="full">{t("calculator.fullTruck")}</option>
                <option value="groupage">{t("calculator.groupage")}</option>
              </select>
            </div>
          </div>

          {cargoType === "groupage" && (
            <>
              <div className={s.field}>
                <label>{t("calculator.volume")}</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder={t("calculator.placeholderVolume")}
                />
              </div>
              <div className={s.field}>
                <label>{t("calculator.weight")}</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={t("calculator.placeholderWeight")}
                />
              </div>
            </>
          )}

          {loading ? (
            <button className={s.calculateBtn} disabled>
              {t("calculator.loading")}
            </button>
          ) : (
            <button className={s.calculateBtn} onClick={handleCalculate}>
              {t("calculator.calculate")}
            </button>
          )}

          {error && <p className={s.error}>{error}</p>}

          {result && !loading && (
            <div className={s.result}>
              <p>
                {t("calculator.distance")}: {result.distance} км
              </p>
              <p>
                {t("calculator.tariff")}: {result.tariff} ₽/км
              </p>
              <p className={s.total}>
                {t("calculator.total")}: {parseFloat(result.price).toFixed(2)} ₽
              </p>
            </div>
          )}

          <p className={s.warn}>{t("calculator.disclaimer")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${s.container} ${theme === "dark" ? s.dark : s.light}`}>
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
                    {t("cabinet.saveAvatar")}
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
            <div className={s.rating}>
              <Star height={12} width={12} />
              <p className={s.ratingNum}>{rating === 5 ? "5.0" : rating}</p>
            </div>
            <RoleSelect userId={id} />
            <p className={s.idTelega}>
              {t("cabinet.telegramId")}: {idTelega}
            </p>
          </div>
        </div>
        <hr />
        <div className={s.company} onClick={() => handleNavigate("company")}>
          <div className={s.icon}>
            <Building2 />
            <p className={s.companyText}>
              {company && company.name ? company.name : t("cabinet.addCompany")}
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
            <p>{t("cabinet.calculator")}</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      <div className={s.paymentContainer}>
        <div className={s.premium} onClick={() => handleNavigate("prem")}>
          <div className={s.iconText}>
            <Star />
            <p>{t("cabinet.subscription")}</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
        <hr />
        <div className={s.support} onClick={() => handleNavigate("support")}>
          <div className={s.iconText}>
            <Headset />
            <p>{t("cabinet.support")}</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      <div className={s.themeChanger}>
        <div className={s.change}>
          <div className={s.iconText}>
            <SunMoon />
            <p>
              {theme === "dark"
                ? t("cabinet.darkTheme")
                : t("cabinet.lightTheme")}
            </p>
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

      <div className={s.paymentContainer}>
        <div
          className={s.support}
          onClick={() => handleNavigate("notification")}
        >
          <div className={s.iconText}>
            <Bell />
            <p>{t("cabinet.notifications")}</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
        <hr />
        <div className={s.support} onClick={() => handleNavigate("conf")}>
          <div className={s.iconText}>
            <LockKeyhole />
            <p>{t("cabinet.privacy")}</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>
      <div className={s.paymentContainer}>
        <div className={s.premium} onClick={() => handleNavigate("lang")}>
          <div className={s.iconText}>
            <Languages />
            <p>{t("cabinet.changeLang")}</p>
          </div>
          <div className={s.str}>
            <ChevronRight />
          </div>
        </div>
      </div>

      {showCalculator && (
        <CalculatorPopup onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
}
