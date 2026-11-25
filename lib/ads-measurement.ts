const ADS_ID = "AW-18590363162";
const LEAD_DESTINATION = `${ADS_ID}/twaACKiFp78dEJrcyaBF`;
const CONSENT_KEY = "ke-fitness-consent-v1";
const CHOICE_LIFETIME = 180 * 24 * 60 * 60 * 1000;

const denied = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;
const measurementAllowed = { ...denied, ad_storage: "granted" } as const;

type Choice = "allowed" | "denied";
type Preference = { choice: Choice; expires: number };
let preference: Preference | null = null;
let tagStarted = false;
const trackedLeads = new Set<string>();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function startGoogleTag() {
  if (tagStarted) return;
  tagStarted = true;

  const layer = (window.dataLayer ??= []);
  const gtag = function (..._args: unknown[]) {
    layer.push(arguments);
  };
  window.gtag = gtag;
  gtag("consent", "default", denied);
  gtag("set", "ads_data_redaction", true);
  gtag("consent", "update", measurementAllowed);
  gtag("js", new Date());
  gtag("config", ADS_ID, { send_page_view: false, allow_ad_personalization_signals: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
  document.head.appendChild(script);
}

export function restoreMeasurementConsent() {
  try {
    const saved: Partial<Preference> | null = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
    preference =
      saved && (saved.choice === "allowed" || saved.choice === "denied") &&
      typeof saved.expires === "number" && saved.expires > Date.now()
        ? { choice: saved.choice, expires: saved.expires }
        : null;
  } catch {
    preference = null;
  }
  applyConsent();
  return preference?.choice ?? null;
}

function applyConsent() {
  if (preference?.choice === "allowed") {
    startGoogleTag();
  } else if (tagStarted) {
    // Stop further measurement on this page, then reload without the Google tag.
    window.gtag?.("consent", "update", denied);
    window.location.reload();
  }
}

export function saveMeasurementConsent(choice: Choice) {
  preference = { choice, expires: Date.now() + CHOICE_LIFETIME };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preference));
  } catch {
    // Where storage is unavailable, use the explicit choice for this page only.
  }
  applyConsent();
}

export function isMeasurementConsentChange(event: StorageEvent) {
  return event.storageArea === localStorage && (event.key === CONSENT_KEY || event.key === null);
}

function canMeasure() {
  return tagStarted && preference?.choice === "allowed" && preference.expires > Date.now();
}

export function trackAcceptedLead(leadId: string) {
  if (!canMeasure() || trackedLeads.has(leadId)) return;
  trackedLeads.add(leadId);
  window.gtag?.("event", "conversion", {
    send_to: LEAD_DESTINATION,
    transaction_id: leadId,
  });
}

function contactChannel(url: URL) {
  if (url.protocol === "mailto:") return "email";
  if (url.protocol === "tel:") return "phone";
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  switch (url.hostname.replace(/^www\./, "")) {
    case "t.me":
    case "telegram.me":
      return "telegram";
    case "instagram.com":
      return "instagram";
    case "wa.me":
    case "api.whatsapp.com":
    case "web.whatsapp.com":
      return "whatsapp";
    case "m.me":
    case "messenger.com":
      return "messenger";
    case "facebook.com":
      return "facebook";
  }
}

export function trackContactClick(target: EventTarget | null) {
  if (!canMeasure() || !(target instanceof Element)) return;
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return;
  let url: URL;
  try {
    url = new URL(link.href);
  } catch {
    return;
  }
  const channel = contactChannel(url);
  if (channel) window.dataLayer?.push({ event: "ke_contact_click", contact_channel: channel });
}
