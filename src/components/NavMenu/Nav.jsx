import React, { useContext } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Map, Truck } from "lucide-react";
import s from "./Nav.module.sass";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export default function Nav() {
  const location = useLocation();
  const isStartPage = location.pathname === "/start";
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();

  const navItems = [
    {
      path: "/home",
      img: "/images/nav-icons/home.svg",
      label: t("nav.home"),
    },
    ...(isAuthenticated && role?.toUpperCase() === "CUSTOMER" ? [{
      path: "/create",
      img: "/images/nav-icons/create.svg",
      label: t("nav.create"),
    }] : []),
    ...(isAuthenticated && role?.toUpperCase() === "LOGISTICIAN" ? [{
      path: "/fleet",
      icon: <Truck size={24} />,
      label: "Машины",
    }] : []),
    {
      path: "/tracker",
      icon: <Map size={24} />,
      label: "Карта",
    },
    {
      path: "/menu",
      img: "/images/nav-icons/menu.svg",
      label: t("nav.menu"),
    },
  ];

  return (
    <div
      id="main-nav"
      className={
        isStartPage
          ? s.containerDisabled
          : `${s.container} ${theme === "dark" ? s.dark : s.light}`
      }
    >
      <div className={s.icons}>
        {navItems.map((item, index) => (
          <React.Fragment key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? `${s.iconDivActive} ${theme === "dark" ? s.dark : s.light}`
                  : s.iconDiv
              }
            >
              {item.img ? (
                <>
                  <div
                    className={`${s.icon} ${
                      location.pathname === item.path ? s.iconActive : ""
                    } ${theme === "dark" ? s.darkIcon : ""}`}
                    style={{
                      WebkitMaskImage: `url(${item.img})`,
                      maskImage: `url(${item.img})`,
                    }}
                  />
                  <p className={s.navText}>{item.label}</p>
                </>
              ) : (
                <>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    transform: location.pathname === item.path ? 'translateY(-2px)' : 'none',
                    color: location.pathname === item.path ? 'var(--tg-theme-button-color, #3390ec)' : 'currentColor'
                  }}>
                    {React.cloneElement(item.icon, {
                      color: location.pathname === item.path ? "var(--tg-theme-button-color, #3390ec)" : "currentColor"
                    })}
                  </div>
                  <p className={s.navText}>{item.label}</p>
                </>
              )}
            </NavLink>
            {index !== navItems.length - 1 && <div className={s.line}></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
