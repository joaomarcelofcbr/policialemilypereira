/* ==========================================================================
   Consentimento de cookies — Emily Pereira 44047
   Controla o carregamento de GA4 e Meta Pixel conforme escolha do visitante.
   Nada de tracking (além do essencial pra lembrar a escolha) roda antes de
   uma decisão explícita: aceitar tudo, rejeitar não essenciais, ou
   personalizar. Ver política de privacidade em privacidade.html.
   ========================================================================== */

// Preencher com os IDs reais quando disponíveis. Enquanto forem os valores
// abaixo, os loaders não fazem nada (evita requisição quebrada com ID falso).
const TRACKING_CONFIG = {
  gaId: 'G-XXXXXXXXXX',
  metaPixelId: 'SEU_PIXEL_ID'
};

const CONSENT_KEY = 'emily44047_cookie_consent';
// Sobe este número sempre que a Política de Privacidade mudar de forma relevante
// (ex.: nova finalidade, novo terceiro) — consentimentos com versão antiga expiram
// na hora, mesmo dentro dos 12 meses, e o banner volta a aparecer.
const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_DAYS = 365; // "por até 12 meses" — ver privacidade.html, seção 7

function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const consent = JSON.parse(raw);
    if (consent.version !== CONSENT_VERSION) return null;
    const ageDays = (Date.now() - new Date(consent.date).getTime()) / 86400000;
    if (ageDays > CONSENT_MAX_AGE_DAYS) return null;
    return consent;
  } catch (e) {
    return null;
  }
}

function setConsent(analytics, marketing) {
  const consent = {
    analytics: !!analytics,
    marketing: !!marketing,
    date: new Date().toISOString(),
    version: CONSENT_VERSION
  };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch (e) {}
  return consent;
}

function isPlaceholder(id) {
  return !id || id.indexOf('XXXX') !== -1 || id === 'SEU_PIXEL_ID';
}

function loadGA4() {
  if (isPlaceholder(TRACKING_CONFIG.gaId) || window.__ga4Loaded) return;
  window.__ga4Loaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TRACKING_CONFIG.gaId;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', TRACKING_CONFIG.gaId);
}

function loadMetaPixel() {
  if (isPlaceholder(TRACKING_CONFIG.metaPixelId) || window.__fbPixelLoaded) return;
  window.__fbPixelLoaded = true;
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', TRACKING_CONFIG.metaPixelId);
  fbq('track', 'PageView');
}

function applyConsent(consent) {
  if (!consent) return;
  if (consent.analytics) loadGA4();
  if (consent.marketing) loadMetaPixel();
}

function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  const modal = document.getElementById('cookiePrefs');
  if (!banner) return;

  const existing = getConsent();
  if (existing) {
    applyConsent(existing);
    return; // já decidiu antes — não mostra o banner de novo
  }

  banner.hidden = false;

  const btnAceitar = document.getElementById('cookieAceitar');
  const btnRejeitar = document.getElementById('cookieRejeitar');
  const btnPersonalizar = document.getElementById('cookiePersonalizar');
  const btnSalvarPrefs = document.getElementById('cookieSalvarPrefs');
  const chkAnalytics = document.getElementById('cookieChkAnalytics');
  const chkMarketing = document.getElementById('cookieChkMarketing');

  function finish(consent) {
    applyConsent(consent);
    banner.hidden = true;
    if (modal) modal.hidden = true;
  }

  if (btnAceitar) btnAceitar.addEventListener('click', function () {
    finish(setConsent(true, true));
  });

  if (btnRejeitar) btnRejeitar.addEventListener('click', function () {
    finish(setConsent(false, false));
  });

  if (btnPersonalizar && modal) btnPersonalizar.addEventListener('click', function () {
    modal.hidden = false;
  });

  if (btnSalvarPrefs) btnSalvarPrefs.addEventListener('click', function () {
    finish(setConsent(chkAnalytics && chkAnalytics.checked, chkMarketing && chkMarketing.checked));
  });
}

document.addEventListener('DOMContentLoaded', initCookieBanner);
