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

export const trackEvent = (eventName: AnalyticsEvent, payload: AnalyticsPayload = {}) => {
  try {
    if (import.meta.env.DEV) {
      console.log('[analytics]', eventName, payload);
    }
  } catch {
    // Analytics must never interrupt the MVP flow.
  }
};
