<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Event;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;
    private Project $project;

    private const PUBLIC_KEY = 'pk_analytics_test';
    private const SERVER_KEY = 'sk_test_analytics_123456';

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = Admin::create([
            'name' => 'Analytics Admin',
            'email' => 'analytics-admin@example.com',
            'password' => 'TestPassword123!',
            'is_active' => true,
        ]);

        $this->project = Project::create([
            'admin_id' => $this->admin->id,
            'name' => 'Analytics Test Project',
            'public_key' => self::PUBLIC_KEY,
            'server_key_hash' => self::SERVER_KEY,
        ]);
    }

    private function headers(): array
    {
        return [
            'Authorization' => 'Bearer '
                . $this->admin->createToken('analytics-test')->plainTextToken,
        ];
    }

    private function createEvent(
        string $name,
        string $visitor,
        string $session,
        string $timestamp,
        array $properties = [],
        ?Project $project = null
    ): Event {
        return Event::create([
            'project_id' => ($project ?? $this->project)->id,
            'event_id' => (string) Str::uuid(),
            'event_name' => $name,
            'anonymous_id' => $visitor,
            'session_id' => $session,
            'user_id' => null,
            'event_timestamp' => $timestamp,
            'source' => 'browser',
            'properties' => $properties,
        ]);
    }

    public function test_project_has_server_key_configured(): void
    {
        $this->assertNotEmpty(
            $this->project->server_key_hash,
            'Project must have a server key configured.'
        );
    }

    public function test_server_key_authenticates_server_event(): void
    {
        $response = $this->withToken(self::SERVER_KEY)
            ->postJson('/api/v1/events', [
                'public_key' => self::PUBLIC_KEY,
                'event_id' => (string) Str::uuid(),
                'event_name' => 'server_test_event',
                'anonymous_id' => 'server-test-visitor',
                'session_id' => 'server-test-session',
                'timestamp' => now()->toISOString(),
                'properties' => ['test' => true],
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('events', [
            'project_id' => $this->project->id,
            'event_name' => 'server_test_event',
            'source' => 'server',
        ]);
    }

    public function test_invalid_server_key_is_rejected(): void
    {
        $response = $this->withToken('sk_invalid_analytics_key')
            ->postJson('/api/v1/events', [
                'public_key' => self::PUBLIC_KEY,
                'event_id' => (string) Str::uuid(),
                'event_name' => 'invalid_server_test',
                'anonymous_id' => 'server-test-visitor',
                'session_id' => 'server-test-session',
                'timestamp' => now()->toISOString(),
                'properties' => [],
            ]);

        $response->assertUnauthorized();

        $this->assertDatabaseMissing('events', [
            'project_id' => $this->project->id,
            'event_name' => 'invalid_server_test',
        ]);
    }

    public function test_summary_returns_expected_metrics(): void
    {
        $this->createEvent(
            'page_view',
            'visitor-1',
            'session-1',
            '2026-10-15 10:00:00',
            ['path' => '/']
        );

        $this->createEvent(
            'page_view',
            'visitor-1',
            'session-1',
            '2026-10-15 10:05:00',
            ['path' => '/products']
        );

        $this->createEvent(
            'add_to_cart',
            'visitor-2',
            'session-2',
            '2026-10-15 11:00:00'
        );

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
            )
            ->assertOk()
            ->assertJson([
                'total_events' => 3,
                'page_views' => 2,
                'unique_visitors' => 2,
                'unique_sessions' => 2,
            ]);
    }

    public function test_summary_rejects_missing_token(): void
    {
        $this->getJson(
            '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
        )->assertUnauthorized();
    }

    public function test_summary_rejects_invalid_token(): void
    {
        $this->withToken('invalid-token')
            ->getJson(
                '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
            )
            ->assertUnauthorized();
    }

    public function test_summary_rejects_unknown_project(): void
    {
        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key=pk_unknown'
            )
            ->assertUnauthorized();
    }

    public function test_summary_supports_date_filters(): void
    {
        $this->createEvent(
            'page_view',
            'visitor-1',
            'session-1',
            '2026-10-10 10:00:00',
            ['path' => '/']
        );

        $this->createEvent(
            'page_view',
            'visitor-2',
            'session-2',
            '2026-10-15 10:00:00',
            ['path' => '/products']
        );

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
                . '&from=2026-10-14&to=2026-10-16'
            )
            ->assertOk()
            ->assertJson([
                'total_events' => 1,
                'page_views' => 1,
                'unique_visitors' => 1,
                'unique_sessions' => 1,
            ]);
    }

    public function test_summary_rejects_invalid_date_range(): void
    {
        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
                . '&from=2026-10-16&to=2026-10-10'
            )
            ->assertUnprocessable();
    }

    public function test_summary_only_counts_events_for_requested_project(): void
    {
        $otherProject = Project::create([
            'admin_id' => $this->admin->id,
            'name' => 'Other Project',
            'public_key' => 'pk_other_project',
            'server_key_hash' => 'sk_test_other_project',
        ]);

        $this->createEvent(
            'page_view',
            'visitor-1',
            'session-1',
            '2026-10-15 10:00:00'
        );

        $this->createEvent(
            'page_view',
            'visitor-2',
            'session-2',
            '2026-10-15 10:00:00',
            [],
            $otherProject
        );

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
            )
            ->assertOk()
            ->assertJson([
                'total_events' => 1,
                'page_views' => 1,
                'unique_visitors' => 1,
                'unique_sessions' => 1,
            ]);
    }

    public function test_admin_cannot_access_another_admin_project(): void
    {
        $otherAdmin = Admin::create([
            'name' => 'Other Admin',
            'email' => 'other-admin@example.com',
            'password' => 'TestPassword123!',
            'is_active' => true,
        ]);

        $otherProject = Project::create([
            'admin_id' => $otherAdmin->id,
            'name' => 'Other Admin Project',
            'public_key' => 'pk_other_admin_project',
            'server_key_hash' => 'sk_test_other_admin_project',
        ]);

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key='
                . $otherProject->public_key
            )
            ->assertUnauthorized();
    }

    public function test_popular_pages_returns_page_view_counts(): void
    {
        $this->createEvent(
            'page_view',
            'visitor-1',
            'session-1',
            '2026-10-15 10:00:00',
            ['path' => '/products']
        );

        $this->createEvent(
            'page_view',
            'visitor-2',
            'session-2',
            '2026-10-15 11:00:00',
            ['path' => '/products']
        );

        $this->createEvent(
            'page_view',
            'visitor-3',
            'session-3',
            '2026-10-15 12:00:00',
            ['path' => '/']
        );

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/popular-pages?public_key=' . self::PUBLIC_KEY
            )
            ->assertOk()
            ->assertJsonFragment([
                'path' => '/products',
                'views' => 2,
            ])
            ->assertJsonFragment([
                'path' => '/',
                'views' => 1,
            ]);
    }

    public function test_event_trends_returns_event_counts(): void
    {
        $this->createEvent(
            'page_view',
            'visitor-1',
            'session-1',
            '2026-10-15 10:00:00'
        );

        $this->createEvent(
            'page_view',
            'visitor-2',
            'session-2',
            '2026-10-15 11:00:00'
        );

        $this->createEvent(
            'add_to_cart',
            'visitor-1',
            'session-1',
            '2026-10-15 12:00:00'
        );

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/event-trends?public_key=' . self::PUBLIC_KEY
            )
            ->assertOk()
            ->assertJsonFragment([
                'event_name' => 'page_view',
                'total' => 2,
            ])
            ->assertJsonFragment([
                'event_name' => 'add_to_cart',
                'total' => 1,
            ]);
    }

    public function test_inactive_admin_cannot_access_analytics(): void
    {
        $this->admin->update(['is_active' => false]);

        $this->withHeaders($this->headers())
            ->getJson(
                '/api/v1/analytics/summary?public_key=' . self::PUBLIC_KEY
            )
            ->assertUnauthorized();
    }
}
