"use client";

import { useEffect, useRef, useState } from "react";
import {
  isMeasurementConsentChange,
  restoreMeasurementConsent,
  saveMeasurementConsent,
} from "../lib/ads-measurement";

export default function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function restore() {
      setOpen(restoreMeasurementConsent() === null);
    }
    restore();
    function sync(event: StorageEvent) {
      if (isMeasurementConsentChange(event)) restore();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function choose(choice: "allowed" | "denied") {
    const returnFocus = document.getElementById("cookie-preferences")?.contains(document.activeElement);
    saveMeasurementConsent(choice);
    setOpen(false);
    if (returnFocus) settingsButton.current?.focus({ preventScroll: true });
  }

  const choiceButton = "flex min-h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-2 py-2 text-center text-sm font-semibold leading-tight text-[#171717] hover:bg-neutral-100 sm:px-4";

  return (
    <>
      <button
        ref={settingsButton}
        type="button"
        className="w-fit underline underline-offset-2 hover:text-white"
        aria-controls="cookie-preferences"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            title.current?.focus({ preventScroll: true });
          } else {
            setOpen(true);
            requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
          }
        }}
      >
        Настройки cookies
      </button>
      <section
        id="cookie-preferences"
        aria-labelledby="cookie-preferences-title"
        hidden={!open}
        className="fixed inset-x-3 bottom-3 z-40 mx-auto max-h-[75dvh] max-w-2xl overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3.5 text-[#171717] shadow-lg sm:inset-x-4 sm:bottom-4 sm:p-6"
      >
        <h2 ref={title} tabIndex={-1} id="cookie-preferences-title" className="text-base font-semibold sm:text-lg">
          Настройки cookies
        </h2>
        <p className="mt-1 text-sm leading-5 text-neutral-700 sm:mt-2 sm:leading-6">
          С вашего согласия Google Ads измеряет заявки с рекламы с помощью cookies. Выбор можно изменить внизу страницы.
        </p>
        <details className="mt-1.5 text-sm leading-5 text-neutral-700 sm:mt-2 sm:leading-6">
          <summary className="w-fit cursor-pointer underline underline-offset-2">Подробнее о cookies</summary>
          <p className="mt-2">
            Ваш выбор хранится в браузере до 180 дней. После согласия Google Ads может использовать
            собственные cookies сайта с префиксом <code>_gcl_</code> (обычно до 90 дней) для хранения
            идентификаторов рекламных переходов. Google получает технические данные, включая IP-адрес,
            сведения о переходе и сигнал об успешной заявке. Контакты и содержимое заявки в Google Ads
            не отправляются. О сторонних cookies и сроках хранения рассказывает{" "}
            <a className="underline" href="https://policies.google.com/technologies/cookies?hl=ru" target="_blank" rel="noreferrer">
              справка Google
            </a>.
          </p>
        </details>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
          <button type="button" className={choiceButton} onClick={() => choose("denied")}>Отказаться</button>
          <button type="button" className={choiceButton} onClick={() => choose("allowed")}>Разрешить измерение</button>
        </div>
      </section>
    </>
  );
}
