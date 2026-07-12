# KE Fitness

Премиальный адаптивный лендинг для персонального онлайн-сопровождения. Стек: Next.js, TypeScript, Tailwind CSS, Framer Motion и Lucide.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

## Публикация на Netlify

1. Создайте новый репозиторий на GitHub и загрузите в него **содержимое** этой папки (папки `app` и `public`, а также `package.json`, `next.config.ts` и остальные файлы рядом с ними).
2. Откройте [Netlify](https://app.netlify.com), войдите в аккаунт и выберите **Add new project → Import an existing project**.
3. Подключите GitHub, выберите созданный репозиторий и нажмите **Deploy**. Netlify распознаёт Next.js автоматически — не меняйте предлагаемые настройки сборки.
4. После завершения сборки откройте **Project configuration → Domain management**: там будет публичный адрес вида `https://имя-сайта.netlify.app`. При желании здесь же подключается собственный домен.

Если Netlify попросит указать параметры вручную, используйте: команда сборки `npm run build`, Node.js `20` или новее. Плагин Next.js Netlify должен оставаться включённым автоматически; поле Publish directory оставьте пустым.

## Перед публикацией

- Проверьте ссылки на мессенджеры и социальные сети.
- В `public/images/` находятся три авторские фотографии: `hero.png`, `about.png` и `contact.png`. Их кадрирование настроено непосредственно в `app/page.tsx`.
