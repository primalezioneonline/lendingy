// Банер cookie з текстом сайту школи. Лише повідомляє: аналітику не вимикає й згоди не запитує
(function () {
  const PRIVACY_URL = "";
  const KEY = "pl_cookie_ok";
  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* приватний режим: покажемо банер */ }
  const box = document.createElement("div");
  box.className = "cookie";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Файли cookie");
  const p = document.createElement("p");
  p.textContent = "Ми використовуємо файли cookie, щоб покращити вам перебування на нашому веб-сайті. Якщо ви продовжите користуватися цим сайтом, ми вважатимемо, що вам це дуже подобається.";
  if (PRIVACY_URL) {
    const a = document.createElement("a");
    a.href = PRIVACY_URL;
    a.textContent = "Політика конфіденційності";
    p.append(" ", a);
  }
  const ok = document.createElement("button");
  ok.type = "button";
  ok.className = "btn yellow";
  ok.textContent = "OK";
  ok.addEventListener("click", () => {
    try { localStorage.setItem(KEY, "1"); } catch (e) { /* банер просто зникне до наступного завантаження */ }
    box.remove();
  });
  box.append(p, ok);
  document.body.append(box);
})();
