import s from "./Header.module.sass";

export default function Header() {
  return (
    <div className={s.header}>
      <div className={s.logo}>
        <img src="/images/header-icons/logo.svg" alt="logo" />
        <div className={s.line}></div>
      </div>
    </div>
  );
}
