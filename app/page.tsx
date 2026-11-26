"use client";

import Image from "next/image";
import ClientResults from "../components/ClientResults";
import CookiePreferences from "../components/CookiePreferences";
import { trackAcceptedLead, trackContactClick } from "../lib/ads-measurement";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Dumbbell, MessageCircle, Play, Salad, ScanLine, Sparkles, TrendingUp, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";

const images = { hero: "/images/hero.png", about: "/images/about-stainless.png", contact: "/images/contact-training.jpg" };
const stockholmTraining = "Персональные тренировки в Стокгольме";
const stockholmServices = [
 "Индивидуальные тренировки в тренажёрном зале, дома и на улице.",
 "Снижение веса и набор мышечной массы.",
 "Обучение правильной технике упражнений.",
 "Индивидуальный подход.",
 "Тренировки на русском языке.",
];

const benefits: [LucideIcon, string, string][] = [
  [Dumbbell,"Индивидуальная программа","Тренировки выстраиваются вокруг вашей цели, графика и доступного оборудования."],
  [Salad,"Рекомендации по питанию","Понятная система питания без крайностей и временных решений."],
  [TrendingUp,"Контроль прогресса","Отслеживаем изменения и опираемся на данные, а не на ощущения."],
  [Play,"Проверка техники","Разбираю видео упражнений, чтобы тренировки были безопаснее и точнее."],
  [MessageCircle,"Постоянная связь","Вы не остаётесь с программой один на один между отчётами."],
  [ScanLine,"Корректировка плана","Регулярно обновляю нагрузку и питание, когда меняются условия и результат."],
];
const plans = [
  { name:"Старт", price:"150", intro:"Для самостоятельного и понятного старта.", items:["Индивидуальная программа тренировок","Рекомендации по питанию","Контроль прогресса","Корректировка программы","Поддержка в мессенджере"] },
  { name:"Стандарт", price:"250", intro:"Больше внимания к деталям и обратной связи.", featured:true, items:["Всё из тарифа «Старт»","Проверка техники упражнений","Разбор питания","Более частая обратная связь","Дополнительные корректировки"] },
  { name:"Премиум", price:"400", intro:"Для тех, кому важен приоритет и максимальная вовлечённость.", items:["Всё из «Стандарт»","Приоритетная поддержка","Неограниченные консультации в рабочее время","Индивидуальная стратегия достижения цели"] },
];
const faqs = [["Можно ли заниматься дома?","Да. Программа учитывает ваше оборудование: от тренировок с собственным весом до полноценного зала."],["Подходит ли сопровождение новичкам?","Да. Нагрузка и объяснения подстраиваются под ваш текущий опыт, поэтому начинать можно без подготовки."],["Нужно ли считать калории?","Не всегда. Мы выбираем формат, который помогает стабильно двигаться к цели и не перегружает повседневную жизнь."],["Как происходит общение?","Основная связь — в мессенджере. Вы отправляете отчёты и вопросы, а я даю обратную связь в согласованном формате."],["Как быстро я получу программу?","После консультации, анкеты, фото и замеров подготовка программы обычно занимает несколько рабочих дней."]];
const rise = { hidden:{opacity:0,y:22}, show:{opacity:1,y:0} };

function ApplicationForm({ plan, onClose }: { plan: string; onClose: () => void }) {
 const isStockholm = plan === stockholmTraining;
 const formTitle = isStockholm ? "Записаться на тренировку" : "Начать сопровождение";
 const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
 const [error, setError] = useState("");
 const submitting = useRef(false);

 async function submitApplication(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (submitting.current) return;
  submitting.current = true;
  setStatus("sending");
  setError("");
  const form = new FormData(event.currentTarget);
  const fallbackError = "Не удалось отправить заявку. Попробуйте ещё раз.";
  let leadId: unknown;
  try {
   const response = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
   const result: { ok?: boolean; leadId?: string; error?: string } | null = await response.json().catch(() => null);
   if (!response.ok || result?.ok !== true) {
    setError(typeof result?.error === "string" ? result.error : fallbackError);
    setStatus("error");
    submitting.current = false;
    return;
   }
   leadId = result.leadId;
  } catch {
   submitting.current = false;
   setError(fallbackError);
   setStatus("error");
   return;
  }
  setStatus("success");
  if (typeof leadId === "string") trackAcceptedLead(leadId);
 }

 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 py-6" role="dialog" aria-modal="true" aria-label={isStockholm ? "Заявка на персональную тренировку" : "Заявка на сопровождение"}>
  <div className="relative max-h-full w-full max-w-md overflow-y-auto bg-white p-7 text-[#171717] shadow-2xl sm:p-9">
   <button type="button" onClick={onClose} className="absolute right-5 top-5 p-1 text-neutral-500 transition-colors hover:text-black" aria-label="Закрыть форму"><X size={20}/></button>
   {status === "success" ? <div className="py-10 pr-8"><p className="eyebrow">Заявка отправлена</p><p className="mt-5 text-2xl font-medium leading-8 tracking-[-.04em]">Спасибо! Я свяжусь с вами в течение 24 часов.</p><button type="button" onClick={onClose} className="btn btn-dark mt-9">Закрыть</button></div> : <>
    <p className="eyebrow pr-6">Заявка · {plan}</p><h2 className="mt-4 text-3xl font-medium tracking-[-.05em]">{formTitle}</h2><p className="mt-3 text-sm leading-6 text-neutral-500">Оставьте контакты — я уточню детали и предложу следующий шаг.</p>
    <form onSubmit={submitApplication} className="mt-8 space-y-5">
     <label className="block text-sm font-medium">Имя<input required name="name" autoComplete="name" className="mt-2 w-full border-b border-neutral-300 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black" /></label>
     <label className="block text-sm font-medium">E-mail<input required name="email" type="email" autoComplete="email" className="mt-2 w-full border-b border-neutral-300 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black" /></label>
     <label className="block text-sm font-medium">Telegram или WhatsApp<input required name="messenger" autoComplete="tel" className="mt-2 w-full border-b border-neutral-300 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black" /></label>
     <label className="block text-sm font-medium">Цель <span className="font-normal text-neutral-400">(необязательно)</span><textarea name="goal" rows={3} className="mt-2 w-full resize-none border-b border-neutral-300 bg-transparent px-0 py-3 outline-none transition-colors focus:border-black" /></label>
     <input type="hidden" name="plan" value={plan}/>
     {status === "error" && <p role="alert" className="text-sm text-red-700">{error}</p>}
     <button disabled={status === "sending"} className="btn btn-dark w-full disabled:cursor-wait disabled:opacity-60">{status === "sending" ? "Отправляем…" : "Отправить заявку"}</button>
    </form>
   </>}
  </div>
 </div>;
}

export default function Home() {
 const [open,setOpen]=useState<number|null>(0);
 const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
 return <main
  onClickCapture={(event) => trackContactClick(event.target)}
  onAuxClickCapture={(event) => { if (event.button === 1) trackContactClick(event.target); }}
 >
  <section className="bg-[#121212] text-white">
   <nav className="shell">
    <div className="flex items-center justify-between border-b border-white/15 py-4 sm:py-6">
     <a href="#top" className="text-lg font-bold tracking-[-.06em]">KE<span className="font-normal"> Fitness</span></a>
     <a href="#contact" className="hidden text-sm text-white/80 sm:block">Связаться <ArrowUpRight className="inline h-4 w-4"/></a>
    </div>
   </nav>
   <div className="shell">
    <div className="grid items-center gap-6 py-7 md:grid-cols-[1.08fr_1fr] md:gap-9 md:py-10 lg:gap-14">
     <motion.div initial="hidden" animate="show" transition={{ staggerChildren: .1 }} className="min-w-0">
      <motion.p variants={rise} transition={{ duration: .65 }} className="eyebrow text-white/70">
       Константин Ефремов · Персональный тренер
      </motion.p>
      <motion.h1 variants={rise} transition={{ duration: .7 }} className="display mt-4 text-[clamp(2.75rem,8vw,4.25rem)] font-semibold sm:mt-5 md:text-[clamp(3.125rem,7.2vw,7rem)]">
       Train Smart.<br/>Get Results.
      </motion.h1>
      <motion.p variants={rise} transition={{ duration: .7 }} className="mt-5 max-w-md text-base leading-7 text-white/80 md:mt-7 md:text-lg">
       Индивидуальные программы тренировок и питания с постоянной поддержкой — независимо от страны проживания.
      </motion.p>
      <motion.div variants={rise} transition={{ duration: .7 }} className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 md:mt-8">
       <a className="btn btn-light !px-4" href="#contact">Начать онлайн сопровождение <ArrowDownRight size={17} className="shrink-0" aria-hidden="true" /></a>
       <a className="btn !px-3 border border-white/45 text-center leading-tight hover:bg-white/10" href="#stockholm">
        {stockholmTraining} <ArrowDownRight size={17} className="shrink-0" aria-hidden="true" />
       </a>
      </motion.div>
      <motion.a variants={rise} transition={{ duration: .7 }} className="mt-2 inline-flex min-h-11 items-center text-sm text-white/75 underline underline-offset-4 hover:text-white md:mt-3" href="#plans">
       Посмотреть тарифы онлайн-сопровождения
      </motion.a>
     </motion.div>
     <div className="relative h-[clamp(13.5rem,65vw,23rem)] overflow-hidden rounded-2xl bg-neutral-900 md:h-[clamp(26rem,58vw,37rem)] lg:h-[min(74svh,41rem)]">
      <Image src={images.hero} alt="Константин Ефремов в тренировочном зале" fill priority sizes="(min-width: 1280px) 540px, (min-width: 768px) 45vw, calc(100vw - 40px)" className="object-cover object-[50%_66%] md:object-[50%_61%]" />
     </div>
    </div>
   </div>
  </section>

  <section id="stockholm" aria-labelledby="stockholm-title" className="border-b border-neutral-200 bg-[#f5f5f3] py-20 sm:py-28">
   <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
    <div>
     <h2 id="stockholm-title" className="display text-4xl font-semibold sm:text-6xl">
      {stockholmTraining}
     </h2>
     <button type="button" className="btn btn-dark mt-8" onClick={() => setSelectedPlan(stockholmTraining)}>
      Записаться на тренировку <ArrowUpRight size={16} aria-hidden="true" />
     </button>
    </div>
    <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
     {stockholmServices.map((service) => (
      <li key={service} className="flex items-start gap-3 py-4 text-base leading-6 text-neutral-700">
       <Check size={17} strokeWidth={1.6} className="mt-1 shrink-0" aria-hidden="true" />
       {service}
      </li>
     ))}
    </ul>
   </div>
  </section>

  <section className="shell py-28 sm:py-40"><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Подход</p><h2 className="display mt-5 text-5xl font-semibold sm:text-7xl">План, который<br/>работает в жизни.</h2></div><p className="max-w-xl self-end text-lg leading-8 text-neutral-600">Без универсальных схем. Мы берём за основу вашу цель, реальный ритм жизни и стартовую точку — затем спокойно и последовательно выстраиваем результат.</p></div>
   <div className="grid-line mt-20 grid border-t border-neutral-200 sm:grid-cols-2 lg:grid-cols-3">{benefits.map(([Icon,title,text],i)=><motion.article key={title as string} initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={rise} transition={{delay:i*.06,duration:.55}} className="min-h-64 border-b border-neutral-200 px-0 py-8 sm:px-7 sm:py-10 lg:px-9"><Icon strokeWidth={1.4} className="h-6 w-6"/><h3 className="mt-14 text-xl font-medium tracking-[-.03em]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-neutral-500">{text}</p></motion.article>)}</div>
  </section>

  <ClientResults/>

  <section id="about" className="bg-[#f5f5f3] py-20 sm:py-28"><div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20"><div className="relative aspect-[4/5] overflow-hidden bg-neutral-200"><Image src={images.about} alt="Константин Ефремов у тренировочной стойки" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-[52%_38%]"/></div><div><p className="eyebrow">Обо мне</p><h2 className="display mt-5 text-5xl font-semibold sm:text-7xl">Константин<br/>Ефремов</h2><p className="mt-5 text-lg font-medium">Персональный тренер.</p><p className="mt-9 max-w-lg text-base leading-8 text-neutral-600">Я помогаю людям похудеть, укрепить мышцы и стать сильнее с помощью индивидуальных программ тренировок, понятных рекомендаций по питанию и регулярного контроля прогресса.</p><ul className="mt-8 max-w-lg border-t border-neutral-200"><li className="flex gap-3 border-b border-neutral-200 py-3 text-sm leading-6 text-neutral-700"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400"/>8 лет в профессиональном спорте — пауэрлифтинг</li><li className="flex gap-3 border-b border-neutral-200 py-3 text-sm leading-6 text-neutral-700"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400"/>Более 5 лет опыта работы персональным тренером</li><li className="flex gap-3 border-b border-neutral-200 py-3 text-sm leading-6 text-neutral-700"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400"/>Диплом о профессиональной переподготовке в сфере физической культуры и фитнес-аэробики</li></ul><a href="#contact" className="mt-10 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-semibold">Обсудить вашу цель <ArrowUpRight size={16}/></a></div></div></section>

  <section className="shell py-28 sm:py-40"><div className="max-w-3xl"><p className="eyebrow">Процесс</p><h2 className="display mt-5 text-5xl font-semibold sm:text-7xl">Чёткий путь<br/>без лишнего.</h2></div><div className="mt-20 border-t border-neutral-200">{["Консультация","Анкета","Фото и замеры","Индивидуальная программа","Еженедельный контроль","Достижение результата"].map((step,i)=><motion.div initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*.05}} className="group flex items-center justify-between border-b border-neutral-200 py-6 sm:py-8" key={step}><span className="w-14 text-xs text-neutral-400">0{i+1}</span><h3 className="mr-auto text-xl tracking-[-.03em] sm:text-3xl">{step}</h3><ArrowDownRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" strokeWidth={1.3}/></motion.div>)}</div></section>

  <section id="plans" className="bg-[#171717] py-28 text-white sm:py-40">
   <div className="shell">
    <div className="flex flex-col justify-between gap-7 sm:flex-row">
     <div>
      <p className="eyebrow text-white/50">Онлайн-сопровождение</p>
      <h2 className="display mt-5 text-5xl font-semibold sm:text-7xl">Выберите формат<br/>работы.</h2>
     </div>
     <p className="max-w-xs self-end text-sm leading-6 text-white/55">Все тарифы включают персональный подход. Можно начать с формата, который комфортен сейчас.</p>
    </div>
    <div className="mt-16 grid gap-4 lg:grid-cols-3">
     {plans.map((plan) => (
      <article
       key={plan.name}
       className={`flex min-h-[500px] flex-col rounded-2xl border p-7 sm:p-9 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-y-0 ${plan.featured ? "border-white bg-white text-[#171717]" : "border-white/15 bg-white/[.045]"}`}
      >
       <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl">{plan.name}</h3>
        {plan.featured && <span className="rounded-full bg-[#171717] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Самый популярный</span>}
       </div>
       <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-neutral-500" : "text-white/50"}`}>{plan.intro}</p>
       <p className="mt-10 text-5xl tracking-[-.06em]">
        {plan.price}<span className="ml-1 text-base tracking-normal">€/месяц</span>
       </p>
       <ul className="mt-10 space-y-3">
        {plan.items.map((item) => (
         <li key={item} className={`flex gap-3 text-sm leading-5 ${plan.featured ? "text-neutral-700" : "text-white/70"}`}>
          <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6}/>
          {item}
         </li>
        ))}
       </ul>
       <div className="mt-auto pt-6">
        <button type="button" onClick={() => setSelectedPlan(plan.name)} className={`btn w-full ${plan.featured ? "btn-dark" : "border border-white/30 text-white"}`}>
         Выбрать тариф <ArrowDownRight size={16}/>
        </button>
       </div>
      </article>
     ))}
    </div>
   </div>
  </section>

  <section className="shell py-28 sm:py-40"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">FAQ</p><h2 className="display mt-5 text-5xl font-semibold sm:text-7xl">Частые<br/>вопросы.</h2></div><div className="border-t border-neutral-200">{faqs.map(([q,a],i)=><div className="border-b border-neutral-200" key={q}><button onClick={()=>setOpen(open===i?null:i)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg tracking-[-.025em] sm:text-xl"><span>{q}</span><ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open===i?"rotate-180":""}`}/></button><AnimatePresence>{open===i&&<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden"><p className="max-w-xl pb-6 text-sm leading-7 text-neutral-500">{a}</p></motion.div>}</AnimatePresence></div>)}</div></div></section>

  <section id="contact" className="bg-black text-white">
   <div className="shell">
    <div className="flex flex-col gap-8 py-10 sm:gap-10 sm:py-14">
     <div className="flex items-center justify-between">
      <span className="font-bold tracking-[-.06em]">KE Fitness</span>
      <span className="text-xs text-white/60">Онлайн · весь мир</span>
     </div>
     <div className="grid items-center gap-8 md:grid-cols-[1fr_.9fr] md:gap-10 lg:gap-16">
      <div>
       <p className="eyebrow text-white/65">Следующий шаг</p>
       <h2 className="display mt-5 max-w-3xl text-6xl font-semibold sm:text-7xl lg:text-8xl">Готовы<br/>начать?</h2>
       <p className="mt-7 max-w-md leading-7 text-white/75">Напишите в удобный мессенджер. На первой консультации разберём вашу цель, условия и подходящий формат работы.</p>
       <div className="mt-9 flex flex-wrap gap-3">
        <a className="btn btn-light" href="https://t.me/efremovtrainer" target="_blank">Telegram <ArrowUpRight size={16}/></a>
        <a className="btn border border-white/35 bg-white/10 text-white" href="https://instagram.com/efremovtrainer" target="_blank">Instagram <ArrowUpRight size={16}/></a>
        <a className="btn border border-white/35 bg-white/10 text-white" href="mailto:efrem77.7735@gmail.com">Email <ArrowUpRight size={16}/></a>
       </div>
      </div>
      <div className="relative aspect-[4/5] w-full max-w-[440px] justify-self-center overflow-hidden rounded-2xl bg-neutral-900 md:justify-self-end">
       <Image
        src={images.contact}
        alt="Константин Ефремов и клиентка во время тренировки в зале"
        fill
        sizes="(min-width: 1024px) 440px, (min-width: 768px) 44vw, (min-width: 480px) 440px, calc(100vw - 40px)"
        className="object-cover object-center"
       />
      </div>
     </div>
     <footer className="flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-xs text-white/60 sm:flex-row">
      <span>© {new Date().getFullYear()} KE Fitness</span>
      <CookiePreferences/>
     </footer>
    </div>
   </div>
  </section>
  {selectedPlan && <ApplicationForm plan={selectedPlan} onClose={() => setSelectedPlan(null)}/>}
 </main>;
}
