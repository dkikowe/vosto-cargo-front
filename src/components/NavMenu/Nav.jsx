import { useLocation } from "react-router-dom";
import s from "./Nav.module.sass";
import { Menu, PackagePlus, Search, Bell, House } from "lucide-react";

export default function Nav() {
  const location = useLocation();
  const isStartPage = location.pathname === "/start";

  const navItems = [
    { path: "/home", icon: <House className={s.icon} />, label: "Главная" },
    { path: "/search", icon: <Search className={s.icon} />, label: "Поиск" },
    {
      path: "/create",
      icon: <PackagePlus className={s.icon} />,
      label: "Создать",
    },
    {
      path: "/notifications",
      icon: <Bell className={s.icon} />,
      label: "Уведомления",
    },
    { path: "/menu", icon: <Menu className={s.icon} />, label: "Меню" },
  ];

  return (
    <div className={isStartPage ? s.containerDisabled : s.container}>
      <div className={s.icons}>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              isActive ? s.iconDivActive : s.iconDiv
            }
          >
            {item.icon}
            <p className={s.navText}>{item.label}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
