# Adapters

`createConsoleAdapter` отправляет summaries через injected logger. `createAnalyticsAdapter` изолирует synchronous throws и rejected promises. `createHttpAdapter` группирует events, проверяет endpoints и использует `fetch` с `credentials: 'omit'`.
