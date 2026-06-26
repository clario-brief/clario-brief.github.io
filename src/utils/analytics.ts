type AnalyticsEvent =
  | 'app_opened'
  | 'brief_started'
  | 'example_brief_opened'
  | 'question_answered'
  | 'custom_answer_used'
  | 'skip_used'
  | 'unknown_used'
  | 'brief_completed'
  | 'brief_copied'
  | 'brief_downloaded'
  | 'brief_restarted';

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

type YandexMetricaOptions = {
  accurateTrackBounce: boolean;
  clickmap: boolean;
  trackLinks: boolean;
  webvisor: boolean;
};

type YandexMetrica = {
  (counterId: number, action: 'init', options: YandexMetricaOptions): void;
  (counterId: number, action: 'reachGoal', target: string, params?: AnalyticsPayload): void;
  (counterId: number, action: 'hit', url: string, params?: AnalyticsPayload): void;
  a?: unknown[];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrica;
  }
}

const YANDEX_METRICA_COUNTER_ID = 110171462;
const YANDEX_METRICA_SCRIPT_ID = 'yandex-metrica-script';

let hasInitializedMetrica = false;
let hasTrackedAppOpened = false;
let lastPageViewPath = '';

const canUseBrowserApi = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const createMetricaQueue = () => {
  if (!canUseBrowserApi() || window.ym) {
    return;
  }

  const queuedMetrica = ((...args: unknown[]) => {
    queuedMetrica.a = queuedMetrica.a || [];
    queuedMetrica.a.push(args);
  }) as YandexMetrica;

  queuedMetrica.l = Date.now();
  window.ym = queuedMetrica;
};

const loadMetricaScript = () => {
  if (!canUseBrowserApi() || document.getElementById(YANDEX_METRICA_SCRIPT_ID)) {
    return;
  }

  const firstScript = document.getElementsByTagName('script')[0];
  const script = document.createElement('script');
  script.async = true;
  script.id = YANDEX_METRICA_SCRIPT_ID;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';

  firstScript?.parentNode?.insertBefore(script, firstScript);
};

const callMetrica = (callback: (ym: YandexMetrica) => void) => {
  try {
    if (!canUseBrowserApi() || !window.ym) {
      return;
    }

    callback(window.ym);
  } catch {
    // Analytics must never interrupt the MVP flow.
  }
};

const initYandexMetrica = () => {
  if (hasInitializedMetrica || !canUseBrowserApi()) {
    return;
  }

  hasInitializedMetrica = true;
  createMetricaQueue();
  loadMetricaScript();
  callMetrica((ym) => {
    ym(YANDEX_METRICA_COUNTER_ID, 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      trackLinks: true,
      webvisor: true,
    });
  });
};

export const trackEvent = (eventName: AnalyticsEvent, payload: AnalyticsPayload = {}) => {
  try {
    if (eventName === 'app_opened') {
      if (hasTrackedAppOpened) {
        return;
      }

      hasTrackedAppOpened = true;
      initYandexMetrica();
    }

    if (import.meta.env.DEV) {
      console.log('[analytics]', eventName, payload);
    }

    callMetrica((ym) => {
      ym(YANDEX_METRICA_COUNTER_ID, 'reachGoal', eventName, payload);
    });
  } catch {
    // Analytics must never interrupt the MVP flow.
  }
};

export const trackPageView = (path: string, payload: AnalyticsPayload = {}) => {
  try {
    if (lastPageViewPath === path) {
      return;
    }

    lastPageViewPath = path;

    if (import.meta.env.DEV) {
      console.log('[analytics]', 'pageview', { path, ...payload });
    }

    callMetrica((ym) => {
      ym(YANDEX_METRICA_COUNTER_ID, 'hit', path, payload);
    });
  } catch {
    // Analytics must never interrupt the MVP flow.
  }
};
