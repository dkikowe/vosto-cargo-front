import React, { useEffect, useState, useContext } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Menu, PackagePlus, Search, Bell, House } from "lucide-react";
import s from "./Nav.module.sass";
import { ThemeContext } from "../../context/ThemeContext";

export default function Nav() {
  const location = useLocation();
  const isStartPage = location.pathname === "/start";
  const { theme } = useContext(ThemeContext);

  const navItems = [
    { path: "/home", icon: <House className={s.icon} />, label: "Заявки" },
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
    <div
      className={
        isStartPage
          ? s.containerDisabled
          : `${s.container} ${theme === "dark" ? s.dark : s.light}`
      }
    >
      <div className={s.icons}>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? `${s.iconDivActive} ${theme === "dark" ? s.dark : s.light}`
                : s.iconDiv
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
