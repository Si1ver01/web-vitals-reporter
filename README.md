# web-vitals-reporter

`web-vitals-reporter` — browser-first TypeScript library для сбора `CLS`, `INP`, `LCP`, `FCP` и `TTFB` и доставки нормализованных событий через небольшие adapters.

## Быстрый старт

```ts
import { createConsoleAdapter, createReporter, createWebVitalsSource } from 'web-vitals-reporter';

const reporter = createReporter({
  source: createWebVitalsSource(),
  adapters: [createConsoleAdapter()],
});

reporter.start();
```

Импорт и создание конфигурации не выполняют побочных эффектов. Явно вызывайте `start()`. При завершении используйте `stop({ flush: true })`, если нужна доставка накопленного batch. `report()` предназначен для тестовых и пользовательских источников.

## Приватность и доставка

События по умолчанию содержат только allowlist scalar fields. Эти no-PII defaults исключают raw `entries`, cookies, user IDs, user-agent data и значения URL query или fragment. HTTP использует `credentials: 'omit'`, `redirect: 'error'`, ограниченный размер body и не выполняет automatic retry. Relative endpoints разрешены в browser или при явном `baseUrl`.

## Разработка

```sh
npm ci
npm run verify
```

Пакет рассчитан на Node.js `24.18.0` и npm `11.16.0`, публикует ESM, CJS и TypeScript declarations из `dist`.
