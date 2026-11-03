// ID від команди. Якщо рядок порожній, цей сервіс не вантажиться і нічого не отримує
const META_PIXEL_ID = "";
const GA4_ID = "";

const CONTENT_NAME = "interaktyvnyi";
const ORDER_KEY = "pl_order_interaktyvnyi";
const ORDER_MAX_AGE = 24 * 60 * 60 * 1000;

window.dataLayer = window.dataLayer || [];
const isThanks = /\/dyakuyemo\/?$/.test(location.pathname);

if (META_PIXEL_ID) {
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
}
if (GA4_ID) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
  document.head.appendChild(s);
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  // Після оплати людина повертається з WayForPay: без ignore_referrer покупка запишеться на WayForPay, а не на рекламу
  window.gtag("config", GA4_ID, isThanks ? { ignore_referrer: true } : {});
}

window.plTrack = function (event, data) {
  const d = Object.assign({ content_name: CONTENT_NAME }, data || {});
  window.dataLayer.push(Object.assign({ event }, d));
  const money = { value: d.value, currency: "UAH", content_name: CONTENT_NAME };
  if (event === "checkout_submit") {
    if (window.fbq) window.fbq("track", "InitiateCheckout", money);
    if (window.gtag) window.gtag("event", "begin_checkout", { value: d.value, currency: "UAH", content_name: CONTENT_NAME, tariff: d.tariff });
  } else if (event === "Purchase") {
    if (window.fbq) window.fbq("track", "Purchase", money, { eventID: d.transaction_id });
    if (window.gtag) window.gtag("event", "purchase", { transaction_id: d.transaction_id, value: d.value, currency: "UAH", content_name: CONTENT_NAME, items: [{ item_name: d.tariff, price: d.value, quantity: 1 }] });
  } else if (window.gtag) {
    window.gtag("event", event, d);
  }
};

// Замовлення живе в браузері покупця: кнопка «Оплатити» його зберігає, сторінка «Дякуємо» читає
window.plSaveOrder = function (order) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(Object.assign({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 8), at: Date.now(), fired: false }, order)));
  } catch (e) { /* приватний режим: Purchase не спрацює, оплата все одно пройде */ }
};
window.plReadOrder = function () {
  try { return JSON.parse(localStorage.getItem(ORDER_KEY)); } catch (e) { return null; }
};

// Purchase рівно один раз і лише якщо людина справді прийшла з нашої кнопки: прямий захід на адресу чи оновлення сторінки покупку не рахують
window.plFirePurchase = function () {
  const o = window.plReadOrder();
  if (!o || o.fired || Date.now() - o.at > ORDER_MAX_AGE) return false;
  o.fired = true;
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(o)); } catch (e) { return false; }
  window.plTrack("Purchase", { transaction_id: o.id, value: o.value, currency: "UAH", tariff: o.tariff });
  return true;
};
