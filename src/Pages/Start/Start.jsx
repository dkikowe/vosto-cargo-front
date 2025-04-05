import { useEffect } from "react";
import s from "./Start.module.sass";

export default function Start() {
  useEffect(() => {
    Telegram.WebApp.openLink("https://vostokargo.pro/");
  }, []);

  return (
    <div className={s.linkContainer}>
      <p>Перенаправление на сайт заказчика...</p>
    </div>
  );
}
