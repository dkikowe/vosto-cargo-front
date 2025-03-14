import s from "./Header.module.sass";

export default function Header() {
  return (
    <div className={s.header}>
      <img src="/images/header-icons/logo.svg" alt="" className={s.logo} />
    </div>
  );
}
