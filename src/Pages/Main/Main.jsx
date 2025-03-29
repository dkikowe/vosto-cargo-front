import React, { useContext } from "react";
import { ParserSwitcher } from "./components/ParserSwitcher";
import { ThemeContext } from "../../context/ThemeContext"; // предполагается, что этот контекст настроен
import s from "./Main.module.sass";

export const Main = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={s.main}>
      <ParserSwitcher theme={theme} />
    </div>
  );
};
