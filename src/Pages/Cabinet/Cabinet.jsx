import React, { useEffect, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axios";
import { Star, Headset, ChevronRight, Building2 } from "lucide-react";
import s from "./Cabinet.module.sass";

export default function Cabinet() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = localStorage.getItem("id");

  // Если роль передана из Start, получаем её из location.state
  const passedRole = location.state?.role || "";

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1.2);

  const [name, setName] = useState("");
  const [role, setRole] = useState(""); // локальное поле роли

  // При монтировании получаем данные пользователя
  useEffect(() => {
    if (!id) {
      navigate("/start");
      return;
    }
    axios.get(`/getUserById/${id}`).then((res) => {
      if (res.data) {
        setUser(res.data);
        setName(res.data.name || "Ваше имя");
        setRole(res.data.role || ""); // если роль уже установлена на сервере, используем её
        setCompany(res.data.company);
        setIsLoading(false);
      }
    });
  }, [id, navigate]);

  // Если роль передана из Start и отличается от полученной, устанавливаем её
  useEffect(() => {
    if (passedRole && passedRole !== role && id) {
      axios
        .post("/setRole", { userId: id, role: passedRole })
        .then(() => {
          setRole(passedRole);
        })
        .catch((error) => {
          console.error("Ошибка при установке роли:", error);
        });
    }
  }, [passedRole, role, id]);

  const saveName = () => {
    axios
      .post("/saveName", { userId: id, name })
      .then((res) => {
        alert("Успешно изменено имя");
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

  function handleNavigate(path) {
    navigate(`/${path}`);
  }

  if (isLoading) {
    return (
      <div className={s.container}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className={s.container}>
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
                  className={s.profileIcon}
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
            <p className={s.role}>{role || "Роль не установлена"}</p>
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
    </div>
  );
}
