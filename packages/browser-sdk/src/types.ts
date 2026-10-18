export type EventProperties = Record<
  string,
  string | number | boolean | null
>;

export interface AnalyticsEvent {
  event_id: string;
  event_name: string;
  anonymous_id: string;
  session_id: string;
  user_id: string | null;
  timestamp: string;
  properties: EventProperties;
}


export interface ConversionRule {
  eventName: string;
  urlIncludes: string;
}

export interface BrowserSDKConfig {
  endpoint: string;
  projectKey: string;
  autoTrackPageViews?: boolean;
  autoTrackClicks?: boolean;
  autoTrackForms?: boolean;
  conversionRules?: ConversionRule[];
}
