# Архитектура

`core` нормализует metrics и управляет lifecycle. `browser` связывает `web-vitals` и page events. `adapters` задают delivery boundaries. `transport` отвечает за batching и HTTP serialization. Core напрямую не читает browser globals.
