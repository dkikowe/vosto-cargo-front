import { useEffect } from "react";
import s from "./Start.module.sass";
import Nav from "../../components/NavMenu/Nav";

export default function Start() {
  useEffect(() => {
    Telegram.WebApp.openLink("https://vostokargo.pro/");
  }, []);

  return (
    <div className={s.linkContainer}>
      <Nav />
    </div>
  );
}
