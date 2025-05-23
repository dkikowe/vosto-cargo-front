import React, { useContext } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Menu, PackagePlus, House } from "lucide-react";
import s from "./Nav.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Nav() {
  const location = useLocation();
  const isStartPage = location.pathname === "/start";
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const navItems = [
    {
      path: "/home",
      img: "/images/nav-icons/home.svg",
      label: t("nav.requests"),
    },
    {
      path: "/create",
      img: "/images/nav-icons/create.svg",

      label: t("nav.create"),
    },
    { path: "/start", img: "/images/nav-icons/logo.svg" },
    {
      path: "/menu",
      img: "/images/nav-icons/menu.svg",
      label: t("nav.menu"),
    },
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
          <>
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? `${s.iconDivActive} ${theme === "dark" ? s.dark : s.light}`
                  : s.iconDiv
              }
            >
              {item.img ? (
                <>
                  <img
                    src={item.img}
                    alt="Logo"
                    className={
                      location.pathname === item.path ? s.iconActive : s.icon
                    }
                  />
                  <p className={s.navText}>{item.label}</p>
                </>
              ) : (
                <>
                  {item.icon}
                  <p className={s.navText}>{item.label}</p>
                </>
              )}
            </NavLink>
            {index !== navItems.length - 1 && <div className={s.line}></div>}
          </>
        ))}
      </div>
    </div>
  );
}
