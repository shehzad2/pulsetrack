import { PulseTrack } from "@pulsetrack/browser-sdk";
import { PULSETRACK_CONFIG } from "./config";

export const analytics = new PulseTrack({
  endpoint: PULSETRACK_CONFIG.endpoint,
  projectKey: PULSETRACK_CONFIG.projectKey,
  autoTrackPageViews: true,
});