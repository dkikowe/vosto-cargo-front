import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  Package,
  MapPin,
  DollarSign,
  Truck,
  Calendar,
} from "lucide-react";
import s from "./Create.module.sass";

const Create = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  const [activeTab, setActiveTab] = useState("manual"); // 'manual' | 'ai'
  const [aiText, setAiText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    cargoDescription: "",
    weight: "",
    volume: "",
    fromAddress: "",
    toAddress: "",
    price: "",
    readyDate: "",
    vehicleType: "TRUCK_20T",
  });

  const handleAiGenerate = async () => {
    if (!aiText.trim()) return;
    setIsAiLoading(true);

    try {
      const { data } = await axios.post("/api/v1/ai/parse", { text: aiText });

      // Map AI response to form data
      setFormData({
        cargoDescription: data.cargo?.description || "",
        weight: data.cargo?.weight || "",
        volume: data.cargo?.volume || "",
        fromAddress: data.route?.from || "",
        toAddress: data.route?.to || "",
        price: data.estimatedPrice?.min || "",
        readyDate: new Date().toISOString().split("T")[0],
        vehicleType: data.recommendedVehicleType || "TRUCK_20T",
      });

      setActiveTab("manual"); // Switch to manual tab to review/edit
      toast.success("Данные успешно заполнены!");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Не удалось распознать текст");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newOrder = {
        customerId: userId,
        cargo: {
          description: formData.cargoDescription,
          weight: Number(formData.weight),
          volume: Number(formData.volume),
          isFragile: false, // Default
          requiresTempControl: false, // Default
        },
        route: {
          from: {
            address: formData.fromAddress,
            city: formData.fromAddress.split(",")[0] || formData.fromAddress,
            coordinates: { lat: 0, lng: 0 },
          },
          to: {
            address: formData.toAddress,
            city: formData.toAddress.split(",")[0] || formData.toAddress,
            coordinates: { lat: 0, lng: 0 },
          },
        },
        pricing: {
          customerOffer: Number(formData.price),
        },
      };

      await axios.post("/orders", newOrder);
      toast.success("Заказ успешно создан!");
      navigate("/home");
    } catch (error) {
      console.error("Create Error:", error);
      toast.error("Ошибка при создании заказа");
    }
  };

  return (
    <div className={s.container}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Новый заказ
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          backgroundColor: "var(--tg-theme-secondary-bg-color, #f5f5f5)",
          borderRadius: "12px",
          padding: "4px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setActiveTab("manual")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            backgroundColor:
              activeTab === "manual"
                ? "var(--tg-theme-bg-color, #fff)"
                : "transparent",
            color:
              activeTab === "manual"
                ? "var(--tg-theme-text-color)"
                : "var(--tg-theme-hint-color)",
            fontWeight: "600",
            boxShadow:
              activeTab === "manual" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
        >
          Вручную
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            backgroundColor:
              activeTab === "ai"
                ? "var(--tg-theme-bg-color, #fff)"
                : "transparent",
            color:
              activeTab === "ai"
                ? "var(--tg-theme-button-color, #3390ec)"
                : "var(--tg-theme-hint-color)",
            fontWeight: "600",
            boxShadow:
              activeTab === "ai" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Sparkles size={16} />
          AI Помощник
        </button>
      </div>

      {/* AI Tab Content */}
      {activeTab === "ai" && (
        <div className="animate-fade-in">
          <div
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #f9fafb)",
              padding: "20px",
              borderRadius: "16px",
              marginBottom: "20px",
              border: "1px solid var(--tg-theme-button-color, #3390ec)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--tg-theme-button-color)",
              }}
            >
              <Sparkles size={20} />
              Умное заполнение
            </h3>
            <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "16px" }}>
              Просто опишите, что и куда нужно отвезти. ИИ сам заполнит форму.
            </p>
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Например: Нужно перевезти 5 тонн кирпича из Москвы в Тулу завтра. Бюджет 20000р."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--tg-theme-hint-color, #ccc)",
                backgroundColor: "var(--tg-theme-bg-color, #fff)",
                color: "var(--tg-theme-text-color)",
                fontSize: "16px",
                resize: "none",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleAiGenerate}
              disabled={isAiLoading || !aiText.trim()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "var(--tg-theme-button-color, #3390ec)",
                color: "var(--tg-theme-button-text-color, #fff)",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isAiLoading ? "wait" : "pointer",
                opacity: isAiLoading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isAiLoading ? "Анализирую..." : "Заполнить форму"}
              {!isAiLoading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Manual Form (Always rendered but hidden if AI tab is active to preserve state, or just switch) */}
      {/* Actually, let's switch view to keep DOM clean, state is preserved in React state */}
      {activeTab === "manual" && (
        <form onSubmit={handleSubmit} className="animate-fade-in">
          {/* Route Section */}
          <section style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MapPin size={20} color="var(--tg-theme-hint-color)" />
              Маршрут
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div className={s.inputGroup}>
                <label
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  Откуда
                </label>
                <input
                  type="text"
                  required
                  value={formData.fromAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, fromAddress: e.target.value })
                  }
                  placeholder="Город, улица, дом"
                  style={inputStyle}
                />
              </div>
              <div className={s.inputGroup}>
                <label
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  Куда
                </label>
                <input
                  type="text"
                  required
                  value={formData.toAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, toAddress: e.target.value })
                  }
                  placeholder="Город, улица, дом"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* Cargo Section */}
          <section style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Package size={20} color="var(--tg-theme-hint-color)" />
              Груз
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div className={s.inputGroup}>
                <label
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  Описание груза
                </label>
                <input
                  type="text"
                  required
                  value={formData.cargoDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cargoDescription: e.target.value,
                    })
                  }
                  placeholder="Например: Строительные материалы"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Вес (кг)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Объем (м³)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <DollarSign size={20} color="var(--tg-theme-hint-color)" />
              Детали
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div className={s.inputGroup}>
                <label
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  Предлагаемая цена (₽)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0"
                  style={{
                    ...inputStyle,
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className={s.inputGroup}>
                <label
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  Дата готовности
                </label>
                <input
                  type="date"
                  value={formData.readyDate}
                  onChange={(e) =>
                    setFormData({ ...formData, readyDate: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "var(--tg-theme-button-color, #3390ec)",
              color: "var(--tg-theme-button-text-color, #fff)",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(51, 144, 236, 0.3)",
            }}
          >
            Создать заказ
          </button>
        </form>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid var(--tg-theme-hint-color, #ccc)",
  backgroundColor: "var(--tg-theme-bg-color, #fff)",
  color: "var(--tg-theme-text-color)",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box",
};

export default Create;
