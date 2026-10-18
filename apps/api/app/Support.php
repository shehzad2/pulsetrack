<?php

namespace App\Support;

use PulseTrack\ServerSdk\PulseTrack;

class PulseTrackAnalytics
{
    public function __construct(
        private readonly PulseTrack $pulsetrack,
    ) {}

    public function track(
        string $eventName,
        array $properties = [],
        array $options = [],
    ): void {
        $this->pulsetrack->track(
            $eventName,
            $properties,
            $options,
        );
    }
}
