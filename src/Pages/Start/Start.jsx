import s from "./Start.module.sass";

export default function Start() {
  return (
    <div className={s.iframeContainer}>
      <iframe
        src="https://vostokargo.pro/" // заменяешь на сайт заказчика
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
