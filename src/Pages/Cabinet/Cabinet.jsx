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
import CalculatorPopup from "../../components/Calculator/Calculator";
import SupportPopup from "../../components/Support";
import SettingsPopup from "../../components/SettingsPopup";
import CompanyPopup from "../Company/CompanyPopup";

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
  const [geoEnabled, setGeoEnabled] = useState(false);

  const [showCalculator, setShowCalculator] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);

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
    if (!geoEnabled) return;

    const sendLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            axios.post("/save-location", {
              userId: id,
              location: coords,
            });
          },
          (error) => {
            console.error("Ошибка получения геопозиции:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    };

    sendLocation(); // сразу
    const interval = setInterval(sendLocation, 30000); // каждые 30 сек

    return () => clearInterval(interval);
  }, [geoEnabled, id]);

  useEffect(() => {
    if (id) {
      axios.get(`/getUserById/${id}`).then((res) => {
        if (res.data) {
          console.log(res.data);
          setUser(res.data);
          setName(res.data.name || t("cabinet.defaultName"));
          setRole(res.data.role);
          setIdTelega(res.data.telegramId);

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
            setCompany(res.data.company);
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

  return (
    <div className={`${s.container} ${theme === "dark" ? s.dark : s.light}`}>
      <div className={s.profileWrapper}>
        <div className={s.profileRating}>
          <img src="/images/design-icons-cab/star.svg" alt="" />
          <p>{rating === 5 ? "5.0" : rating}</p>
        </div>
        <div className={s.profileContainer}>
          <div className={s.profile}>
            <div className={s.photo}>
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
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#333" : undefined,
                          color: theme === "dark" ? "#fff" : undefined,
                        }}
                      />
                      <button
                        onClick={handleSaveAvatar}
                        className={s.saveButton}
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#356dbb" : undefined,
                          color: theme === "dark" ? "#fff" : undefined,
                        }}
                      >
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
                      className="absolute right-[0px] h-[20px] w-[20px] bottom-0"
                      src="/images/design-icons-cab/photos.svg"
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
            </div>
            <div className={s.desc}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={s.name}
                onBlur={saveName}
                style={{
                  color: theme === "dark" ? "#fff" : undefined,
                  backgroundColor: theme === "dark" ? "transparent" : undefined,
                }}
              />
              <RoleSelect userId={id} />
            </div>
          </div>
          <div className={s.profileBottom}>
            <p className={s.idTelega}>
              {t("cabinet.telegramId")}: {idTelega}
            </p>
            <div className={s.actions}>
              <div className={s.action}>
                <img
                  src="/images/design-icons-cab/bell.svg"
                  className="w-[18px] h-[18px]"
                  alt=""
                  onClick={() => navigate("/notification")}
                />
              </div>
              <div
                className={s.action}
                onClick={() => setShowSettings(true)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src="/images/design-icons-cab/settings.svg"
                  className="w-[18px] h-[18px]"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.company}>
        <div className={s.companyTop}>
          {company && company.photo ? (
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
              <img src={company.photo} alt="" className="w-full h-full" />
            </div>
          ) : (
            <img
              src="/images/design-icons-cab/company.svg"
              className="w-[50px] h-[50px]"
              alt=""
            />
          )}
          <div className={s.companyName}>
            <p
              className={s.name}
              style={{ color: theme === "dark" ? "#fff" : undefined }}
            >
              {t("cabinet.yourCompany")}
            </p>
            <p
              className={s.comp}
              style={{ color: theme === "dark" ? "#bbb" : undefined }}
            >
              {company && company.name ? company.name : t("cabinet.empty")}
            </p>
          </div>
        </div>
        <div className={s.companyBottom}>
          <p
            className={s.companyBottomButton}
            onClick={() => setShowCompanyPopup(true)}
          >
            {company && company.name
              ? t("cabinet.changeCompany")
              : t("cabinet.addCompany")}
            <div className={s.plusik}>
              <p>+</p>
            </div>
          </p>
        </div>
      </div>

      <div className={s.geoToggle}>
        <div className={s.geoToggleLeft}>
          <svg
            className={s.geoToggleIcon}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke={theme === "dark" ? "#fff" : "#2563eb"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 21s-6-5.686-6-10a6 6 0 0112 0c0 4.314-6 10-6 10z"></path>
            <circle cx="12" cy="11" r="2"></circle>
          </svg>
          <span
            className={s.geoToggleLabel}
            style={{ color: theme === "dark" ? "#fff" : undefined }}
          >
            {t("cabinet.geolocation")}
          </span>
        </div>
        <div
          className={`${s.geoToggleSwitch} ${geoEnabled ? s.enabled : ""}`}
          onClick={() => setGeoEnabled(!geoEnabled)}
        >
          <div className={s.geoToggleThumb} />
        </div>
      </div>

      <div className={s.otherBlock}>
        <div
          className={s.other}
          onClick={() => setShowCalculator(true)}
          style={{ cursor: "pointer" }}
        >
          <img src="/images/design-icons-cab/calculator.svg" alt="" />
          <p>{t("cabinet.calculator")}</p>
        </div>
        <div className={s.divider}></div>
        <div className={s.other}>
          <img
            src="/images/design-icons-cab/prem.svg"
            onClick={() => navigate("/prem")}
            alt=""
          />
          <p>{t("cabinet.subscription")}</p>
        </div>
        <div className={s.divider}></div>
        <div
          className={s.other}
          onClick={() => setShowSupport(true)}
          style={{ cursor: "pointer" }}
        >
          <img src="/images/design-icons-cab/support.svg" alt="" />
          <p>{t("cabinet.support")}</p>
        </div>
      </div>

      {showCalculator && (
        <CalculatorPopup
          onClose={() => setShowCalculator(false)}
          theme={theme}
          t={t}
        />
      )}
      {showSupport && (
        <SupportPopup
          onClose={() => setShowSupport(false)}
          theme={theme}
          t={t}
        />
      )}
      {showSettings && (
        <SettingsPopup
          onClose={() => setShowSettings(false)}
          theme={theme}
          t={t}
          isDark={theme === "dark"}
          toggleTheme={toggleTheme}
          currentLang={i18n.language === "ru" ? "русский" : i18n.language}
          onLanguage={() => {
            /* тут можно открыть LanguageSelector */
          }}
          onPrivacy={() => {
            /* тут можно открыть Privacy */
          }}
        />
      )}
      {showCompanyPopup && (
        <CompanyPopup
          onClose={() => setShowCompanyPopup(false)}
          userId={id}
          initialData={company}
        />
      )}
    </div>
  );
}
