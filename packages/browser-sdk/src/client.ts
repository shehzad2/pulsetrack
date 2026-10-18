
import type {
  AnalyticsEvent,
  BrowserSDKConfig,
  ConversionRule,
  EventProperties,
} from "./types";

import { getSessionId, getVisitorId } from "./identity";

export class PulseTrack {
  private visitorId: string;
  private userId: string | null = null;
  private endpoint: string;
  private projectKey: string;

  private autoTrackClicks: boolean;
  private autoTrackForms: boolean;

  private clickHandler?: (event: MouseEvent) => void;
  private formHandler?: (event: SubmitEvent) => void;
  private popstateHandler?: () => void;
  private navigationHandler?: () => void;

  private conversionRules: ConversionRule[];
  private matchedConversions = new Set<string>();
  private lastConversionUrl = "";

  private originalPushState?: History["pushState"];
  private originalReplaceState?: History["replaceState"];
  private pushStateWrapper?: History["pushState"];
  private replaceStateWrapper?: History["replaceState"];

  constructor(config: BrowserSDKConfig) {
    this.endpoint = config.endpoint.replace(/\/+$/, "");
    this.projectKey = config.projectKey;
    this.visitorId = getVisitorId();

    this.autoTrackClicks = config.autoTrackClicks === true;
    this.autoTrackForms = config.autoTrackForms === true;
    this.conversionRules = config.conversionRules ?? [];

    if (config.autoTrackPageViews !== false) {
      this.page();
    }

    this.setupAutoTracking();
    this.setupConversionTracking();
  }

  private setupAutoTracking(): void {
    if (typeof document === "undefined") return;

    if (this.autoTrackClicks) {
      this.clickHandler = (event: MouseEvent) => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const element = target.closest(
          "button, a, [data-analytics-event]"
        );

        if (!element) return;

        const customEventName = element.getAttribute(
          "data-analytics-event"
        );

        if (customEventName) {
          void this.track(customEventName, {
            element_tag: element.tagName.toLowerCase(),
            page_path: window.location.pathname,
          });

          return;
        }

        void this.track("click", {
          element_tag: element.tagName.toLowerCase(),
          element_text: (element.textContent || "")
            .trim()
            .slice(0, 100),
          page_path: window.location.pathname,
        });
      };

      document.addEventListener("click", this.clickHandler);
    }

    if (this.autoTrackForms) {
      this.formHandler = (event: SubmitEvent) => {
        const form = event.target;

        if (!(form instanceof HTMLFormElement)) return;

        void this.track("form_submit", {
          page_path: window.location.pathname,
          form_id: form.id || "",
          form_name: form.getAttribute("name") || "",
        });
      };

      document.addEventListener("submit", this.formHandler);
    }
  }

  private setupConversionTracking(): void {
    if (
      typeof window === "undefined" ||
      this.conversionRules.length === 0
    ) {
      return;
    }

    const checkUrl = () => {
      const currentUrl =
        window.location.pathname + window.location.search;

      if (currentUrl === this.lastConversionUrl) return;

      this.lastConversionUrl = currentUrl;

      for (const rule of this.conversionRules) {
        if (!rule.urlIncludes || !currentUrl.includes(rule.urlIncludes)) {
          continue;
        }

        const matchKey = `${rule.eventName}:${currentUrl}`;

        if (this.matchedConversions.has(matchKey)) continue;

        this.matchedConversions.add(matchKey);

        void this.track(rule.eventName, {
          page_path: currentUrl,
          detection_method: "url_rule",
        });
      }
    };

    this.originalPushState = window.history.pushState;
    this.originalReplaceState = window.history.replaceState;

    const originalPushState = this.originalPushState;
    const originalReplaceState = this.originalReplaceState;

    this.pushStateWrapper = function (
      this: History,
      ...args: Parameters<History["pushState"]>
    ) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event("pulsetrack:navigation"));
    };

    this.replaceStateWrapper = function (
      this: History,
      ...args: Parameters<History["replaceState"]>
    ) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event("pulsetrack:navigation"));
    };

    window.history.pushState = this.pushStateWrapper;
    window.history.replaceState = this.replaceStateWrapper;

    this.popstateHandler = checkUrl;
    this.navigationHandler = checkUrl;

    window.addEventListener("popstate", this.popstateHandler);
    window.addEventListener(
      "pulsetrack:navigation",
      this.navigationHandler
    );

    checkUrl();
  }

  async track(
    eventName: string,
    properties: EventProperties = {}
  ): Promise<void> {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,99}$/.test(eventName)) {
      throw new Error("Invalid analytics event name");
    }

    const event = this.createEvent(eventName, properties);

    try {
      const response = await fetch(
        `${this.endpoint}/api/v1/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_key: this.projectKey,
            ...event,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "PulseTrack request failed:",
          response.status
        );
      }
    } catch (error) {
      console.error("PulseTrack network error:", error);
    }
  }

  private createEvent(
    eventName: string,
    properties: EventProperties
  ): AnalyticsEvent {
    return {
      event_id: crypto.randomUUID(),
      event_name: eventName,
      anonymous_id: this.visitorId,
      session_id: getSessionId(),
      user_id: this.userId,
      timestamp: new Date().toISOString(),
      properties,
    };
  }

  page(): void {
    if (typeof window === "undefined") return;

    void this.track("page_view", {
      page_path:
        window.location.pathname + window.location.search,
      page_title: document.title,
      referrer: document.referrer,
    });
  }

  identify(userId: string): void {
    this.userId = userId;
  }

  resetIdentity(): void {
    this.userId = null;
  }

  destroy(): void {
    if (typeof document !== "undefined") {
      if (this.clickHandler) {
        document.removeEventListener("click", this.clickHandler);
        this.clickHandler = undefined;
      }

      if (this.formHandler) {
        document.removeEventListener("submit", this.formHandler);
        this.formHandler = undefined;
      }
    }

    if (typeof window === "undefined") return;

    if (this.popstateHandler) {
      window.removeEventListener("popstate", this.popstateHandler);
      this.popstateHandler = undefined;
    }

    if (this.navigationHandler) {
      window.removeEventListener(
        "pulsetrack:navigation",
        this.navigationHandler
      );
      this.navigationHandler = undefined;
    }

    if (
      this.originalPushState &&
      this.pushStateWrapper &&
      window.history.pushState === this.pushStateWrapper
    ) {
      window.history.pushState = this.originalPushState;
    }

    if (
      this.originalReplaceState &&
      this.replaceStateWrapper &&
      window.history.replaceState === this.replaceStateWrapper
    ) {
      window.history.replaceState = this.originalReplaceState;
    }
  }
}
