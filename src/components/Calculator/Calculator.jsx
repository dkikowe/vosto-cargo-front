import React, { useState } from "react";
import s from "./Calculator.module.sass";
import axios from "../../axios"; // <-- Ваш конфиг axios (например, с базовым URL и пр.)

export default function CalculatorPopup({ isOpen, onClose }) {
  const [cityA, setCityA] = useState("");
  const [cityB, setCityB] = useState("");
  const [rate, setRate] = useState("");
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);

  async function getCoordinates(cityName) {
    // Запрос к Яндекс.Геокодеру
    // Документация: https://yandex.ru/dev/maps/geocoder
    const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=6f430e40-1644-44a5-b758-197e7a073e5b&format=json&geocode=${encodeURIComponent(
      cityName
    )}`;

    // Вместо fetch используем axios.get
    const response = await axios.get(geocodeUrl);
    const data = response.data;
    const featureMember = data?.response?.GeoObjectCollection?.featureMember;
    if (!featureMember || !featureMember.length) {
      throw new Error("Не удалось получить координаты города " + cityName);
    }

    const coordsString = featureMember[0].GeoObject.Point.pos; // "долгота широта"
    const [lon, lat] = coordsString.split(" ").map(Number);

    return { lat, lon };
  }

  async function getRouteDistance(latA, lonA, latB, lonB) {
    // Запрос к Яндекс.Routing API
    // Документация: https://yandex.ru/dev/maps/routes
    const routeUrl = `https://api.routing.yandex.net/v2/route?apikey=f7efe847-44ce-4616-bdac-943545246b8b&waypoints=${latA},${lonA}|${latB},${lonB}&avoid_tolls=YES&lang=ru_RU`;

    // Аналогично через axios.get
    const response = await axios.get(routeUrl);
    const data = response.data;

    const route = data?.routes?.[0];
    if (!route || !route.legs?.[0]?.distance?.value) {
      throw new Error("Не удалось получить данные о маршруте");
    }

    // Расстояние приходит в метрах
    return route.legs[0].distance.value;
  }

  async function handleCalculate() {
    if (!cityA || !cityB || !rate) return;
    try {
      // 1) Получаем координаты обоих городов
      const coordsA = await getCoordinates(cityA);
      const coordsB = await getCoordinates(cityB);

      // 2) Вызываем Routing API, чтобы узнать расстояние
      const distMeters = await getRouteDistance(
        coordsA.lat,
        coordsA.lon,
        coordsB.lat,
        coordsB.lon
      );
      const distKm = distMeters / 1000;

      // 3) Считаем цену за км (простая формула: rate / distance)
      setDistance(distKm);
      setPrice(Number(rate) / distKm);
    } catch (error) {
      console.error(error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={s.overlay}>
      <div className={s.popup}>
        <button className={s.closeBtn} onClick={onClose}>
          ×
        </button>
        <h2>Калькулятор цены за км (Яндекс)</h2>
        <input
          type="text"
          placeholder="Город A"
          value={cityA}
          onChange={(e) => setCityA(e.target.value)}
        />
        <input
          type="text"
          placeholder="Город B"
          value={cityB}
          onChange={(e) => setCityB(e.target.value)}
        />
        <input
          type="number"
          placeholder="Ставка в рублях"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <button onClick={handleCalculate}>Рассчитать</button>
        <div className={s.result}>
          <p>Расстояние: {distance ? `${distance.toFixed(2)} км` : "-"}</p>
          <p>Цена за км: {price ? `${price.toFixed(2)} руб.` : "-"}</p>
        </div>
      </div>
    </div>
  );
}
