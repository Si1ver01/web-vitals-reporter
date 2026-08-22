# Доставка

Delivery ограничена по размеру и не сохраняется постоянно. При переполнении queue удаляется самое старое event. Flush выполняется single-flight и запускается вручную, по interval, через `pagehide` или `visibilitychange`. Failed events считаются и не retry автоматически.
