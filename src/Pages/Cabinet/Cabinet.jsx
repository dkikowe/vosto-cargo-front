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

// ...импорты остаются без изменений...

export default function Cabinet() {
  // const initData = window.Telegram.WebApp.initData;
  const initData =
    "user=%7B%22id%22%3A5056024242%2C%22first_name%22%3A%22%3C%5C%2Fabeke%3E%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22abylaikak%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAj3hfrbNq8PfLLKvsSp3-WizcXTc3HO8Vynsw3R1a1A5spK3fDmZERABNoOGLEQN.svg%22%7D&chat_instance=-4908992446394523843&chat_type=private&auth_date=1735556539&signature=pgNJfzcxYGAcJCJ_jnsYEsmiTJJxOP2tNKb941-fT7QcsUQ2chSkFcItG8KvjR_r3nH0vem4bxtlltuyX-IwBQ&hash=c0b510163f5b1dea53172644df35e63458216a9d5d9a10413af4f5b0204bb493";
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
                      />
                      <button
                        onClick={handleSaveAvatar}
                        className={s.saveButton}
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
                        avatarLoaded
                          ? "opacity-100 w-[70px] h-[70px] "
                          : "opacity-0 w-full"
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
                />
              </div>
              <div className={s.action}>
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
          <img src="/images/design-icons-cab/company.svg" alt="" />
          <div className={s.companyName}>
            <p className={s.name}>Ваша компания</p>
            <p className={s.comp}>
              {company && company.name ? company.name : "Пока пусто"}
            </p>
          </div>
        </div>
        <div className={s.companyBottom}>
          <p className={s.companyBottomButton}>
            {company && company.name
              ? "Изменить компанию"
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
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 21s-6-5.686-6-10a6 6 0 0112 0c0 4.314-6 10-6 10z"></path>
            <circle cx="12" cy="11" r="2"></circle>
          </svg>
          <span className={s.geoToggleLabel}>Геопозиция</span>
        </div>
        <div className={s.geoToggleSwitch}>
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
        <div className={s.other}>
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
    </div>
  );
}
