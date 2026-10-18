import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import { PulseTrack } from "../src/client";

describe("PulseTrack Browser SDK", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 202,
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should track a custom event", async () => {
    const analytics = new PulseTrack({
      endpoint: "http://localhost:8000",
      projectKey: "test-project",
      autoTrackPageViews: false,
    });

    await analytics.track("add_to_cart", {
      product_id: "burger-001",
      quantity: 2,
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toBe(
      "http://localhost:8000/api/v1/events"
    );

    const body = JSON.parse(
      String(options?.body)
    );

    expect(body.event_name).toBe("add_to_cart");
    expect(body.properties.quantity).toBe(2);
    expect(body.anonymous_id).toBeTruthy();
    expect(body.session_id).toBeTruthy();
    expect(body.event_id).toBeTruthy();
  });

  it("should automatically track page views", async () => {
    new PulseTrack({
      endpoint: "http://localhost:8000",
      projectKey: "test-project",
      autoTrackPageViews: true,
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    const [, options] = vi.mocked(fetch).mock.calls[0];

    const body = JSON.parse(
      String(options?.body)
    );

    expect(body.event_name).toBe("page_view");
  });

  it("should identify a logged-in user", async () => {
    const analytics = new PulseTrack({
      endpoint: "http://localhost:8000",
      projectKey: "test-project",
      autoTrackPageViews: false,
    });

    analytics.identify("user-123");

    await analytics.track("menu_view");

    const [, options] = vi.mocked(fetch).mock.calls[0];

    const body = JSON.parse(
      String(options?.body)
    );

    expect(body.user_id).toBe("user-123");
  });


  it("should track button clicks when enabled", () => {
    new PulseTrack({
      endpoint: "http://localhost:8000",
      projectKey: "test-project",
      autoTrackPageViews: false,
      autoTrackClicks: true,
    });

    const button = document.createElement("button");
    button.textContent = "Add to cart";
    document.body.appendChild(button);

    button.click();

    expect(fetch).toHaveBeenCalledTimes(1);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(String(options?.body));

    expect(body.event_name).toBe("click");
    expect(body.properties.element_tag).toBe("button");
    expect(body.properties.element_text).toBe("Add to cart");

    button.remove();
  });

  it("should track form submissions without capturing field values", () => {
    new PulseTrack({
      endpoint: "http://localhost:8000",
      projectKey: "test-project",
      autoTrackPageViews: false,
      autoTrackForms: true,
    });

    const form = document.createElement("form");
    form.id = "checkout-form";

    const input = document.createElement("input");
    input.name = "password";
    input.value = "secret-value";
    form.appendChild(input);
    document.body.appendChild(form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    form.dispatchEvent(
      new Event("submit", {
        bubbles: true,
        cancelable: true,
      })
    );

    expect(fetch).toHaveBeenCalledTimes(1);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(String(options?.body));

    expect(body.event_name).toBe("form_submit");
    expect(body.properties.form_id).toBe("checkout-form");
    expect(JSON.stringify(body)).not.toContain("secret-value");

    form.remove();
  });

it("should track a configured conversion on SPA navigation", async () => {
  const analytics = new PulseTrack({
    endpoint: "http://localhost:8000",
    projectKey: "test-project",
    autoTrackPageViews: false,
    conversionRules: [
      {
        eventName: "order_created",
        urlIncludes: "/thank-you/",
      },
    ],
  });

  window.history.pushState({}, "", "/thank-you/123");

  // Let the SDK's navigation event listener run.
  await Promise.resolve();

  expect(fetch).toHaveBeenCalledTimes(1);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  const body = JSON.parse(String(options?.body));

  expect(body.event_name).toBe("order_created");
  expect(body.properties.page_path).toBe("/thank-you/123");
  expect(body.properties.detection_method).toBe("url_rule");

  analytics.destroy();
  window.history.replaceState({}, "", "/");
});

});