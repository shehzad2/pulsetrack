
import { PulseTrack } from "@pulsetrack/browser-sdk";

export const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "pk_86429cfe1fce7298b28040960046bd6b",
  autoTrackPageViews: true,
});
