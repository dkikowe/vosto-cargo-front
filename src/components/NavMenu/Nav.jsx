import s from "./Nav.module.sass";
import { Menu, PackagePlus, Search, Bell, House } from "lucide-react";

export default function Nav() {
  return (
    <div className={s.container}>
      <div className={s.icons}>
        <div className={s.iconDiv}>
          <House сlassName={s.icon} />
          <p className={s.navText}>Главная</p>
        </div>
        <div className={s.iconDiv}>
          <Search сlassName={s.icon} />
          <p className={s.navText}>Поиск</p>
        </div>
        <div className={s.iconDiv}>
          <PackagePlus сlassName={s.icon} />
          <p className={s.navText}>Создать </p>
        </div>
        <div className={s.iconDiv}>
          <Bell сlassName={s.icon} />
          <p className={s.navText}>Уведомления</p>
        </div>
        <div className={s.iconDivActive}>
          <Menu сlassName={s.icon} />
          <p className={s.navText}>Меню</p>
        </div>
      </div>
    </div>
  );
}
