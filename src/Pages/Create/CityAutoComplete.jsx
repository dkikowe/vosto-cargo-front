import React, { useState, useEffect } from "react";
import s from "./Create.module.sass";

export function CityAutocomplete({ onCitySelect }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citySelected, setCitySelected] = useState(false);

  // Эффект с дебаунсом для уменьшения количества запросов к API
  useEffect(() => {
    // Если город выбран, не ищем подсказки
    if (citySelected) {
      return;
    }
    if (inputValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetch(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Token f6cb27d4a05446a0c8d359621f7fb88600a9dc4d", // Замените на ваш API-ключ
          },
          body: JSON.stringify({
            query: inputValue,
            count: 5,
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          // Фильтруем только те подсказки, у которых есть название города
          const citySuggestions = data.suggestions.filter(
            (item) => item.data.city || item.data.settlement
          );
          setSuggestions(citySuggestions);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Ошибка при получении подсказок:", error);
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, citySelected]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    // Сбрасываем флаг, если пользователь начинает ввод
    setCitySelected(false);
  };

  const handleSelect = (cityValue) => {
    setInputValue(cityValue);
    setSuggestions([]);
    setCitySelected(true);
    if (onCitySelect) {
      onCitySelect(cityValue);
    }
  };

  return (
    <div className={s.autocompleteWrapper}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Введите город..."
        className={s.input}
      />
      {loading && <div className={s.loading}>Загрузка...</div>}
      {suggestions.length > 0 && !citySelected && (
        <div className={s.dropdown}>
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item.value)}
              className={s.dropdownItem}
            >
              {item.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
