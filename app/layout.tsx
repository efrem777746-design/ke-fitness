import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "KE Fitness — Персональное онлайн-сопровождение", description: "Индивидуальные тренировки и питание с постоянной поддержкой." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
