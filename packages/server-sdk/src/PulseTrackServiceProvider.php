<?php

namespace PulseTrack\ServerSdk;

use Illuminate\Support\ServiceProvider;

class PulseTrackServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/pulsetrack.php',
            'pulsetrack'
        );

        $this->app->singleton(PulseTrack::class, function ($app) {
            return new PulseTrack(
                $app->make('Illuminate\Http\Client\Factory'),
                $app['config']->get('pulsetrack', [])
            );
        });

        $this->app->alias(PulseTrack::class, 'pulsetrack');
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/pulsetrack.php' => config_path('pulsetrack.php'),
        ], 'pulsetrack-config');
    }
}
