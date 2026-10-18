<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Event;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EventIngestionTest extends TestCase
{
    use RefreshDatabase;

    private const PUBLIC_KEY = 'pk_test_project';
    private const SERVER_KEY = 'sk_test_server_secret';

    protected function setUp(): void
    {
        parent::setUp();

        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin-ingestion-test@example.com',
            'password' => Hash::make('TestPassword123!'),
            'is_active' => true,
        ]);

        Project::create([
            'admin_id' => $admin->id,
            'name' => 'Test Project',
            'public_key' => self::PUBLIC_KEY,
            'server_key_hash' => hash('sha256', self::SERVER_KEY),
        ]);
    }


    private function payload(): array
    {
        return [
            'project_key' => self::PUBLIC_KEY,
            'event_id' => '123e4567-e89b-42d3-a456-426614174000',
            'event_name' => 'test_event',
            'anonymous_id' => 'visitor-test',
            'session_id' => 'session-test',
            'user_id' => null,
            'timestamp' => now()->toISOString(),
            'properties' => ['source_test' => true],
        ];
    }

    public function test_browser_event_is_accepted_with_public_key(): void
    {
        $response = $this->postJson(
            '/api/v1/events',
            $this->payload()
        );

        $response->assertStatus(202);

        $this->assertDatabaseHas('events', [
            'event_name' => 'test_event',
            'source' => 'browser',
        ]);
    }

    public function test_server_event_is_accepted_with_valid_server_key(): void
    {
        $response = $this
            ->withToken(self::SERVER_KEY)
            ->postJson('/api/v1/events', $this->payload());

        $response->assertStatus(202);

        $this->assertDatabaseHas('events', [
            'event_name' => 'test_event',
            'source' => 'server',
        ]);
    }

    public function test_invalid_server_key_is_rejected(): void
    {
        $response = $this
            ->withToken('sk_invalid_key')
            ->postJson('/api/v1/events', $this->payload());

        $response->assertUnauthorized();

        $this->assertDatabaseCount('events', 0);
    }

    public function test_repeated_event_id_does_not_create_duplicate(): void
    {
        $payload = $this->payload();

        $this->postJson('/api/v1/events', $payload)
            ->assertStatus(202);

        $this->postJson('/api/v1/events', $payload)
            ->assertStatus(202);

        $this->assertSame(1, Event::count());
    }

    public function test_missing_required_fields_are_rejected(): void
    {
        $response = $this->postJson('/api/v1/events', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'project_key',
                'event_id',
                'event_name',
                'anonymous_id',
                'session_id',
                'timestamp',
            ]);

        $this->assertDatabaseCount('events', 0);
    }

    public function test_invalid_event_id_is_rejected(): void
    {
        $payload = $this->payload();
        $payload['event_id'] = 'not-a-uuid';

        $this->postJson('/api/v1/events', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['event_id']);

        $this->assertDatabaseCount('events', 0);
    }

    public function test_invalid_event_name_is_rejected(): void
    {
        $payload = $this->payload();
        $payload['event_name'] = '123 invalid name!';

        $this->postJson('/api/v1/events', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['event_name']);

        $this->assertDatabaseCount('events', 0);
    }

    public function test_unknown_project_key_is_rejected(): void
    {
        $payload = $this->payload();
        $payload['project_key'] = 'pk_unknown_project';

        $this->postJson('/api/v1/events', $payload)
            ->assertUnauthorized();

        $this->assertDatabaseCount('events', 0);
    }

    public function test_invalid_timestamp_is_rejected(): void
    {
        $payload = $this->payload();
        $payload['timestamp'] = 'not-a-date';

        $this->postJson('/api/v1/events', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['timestamp']);

        $this->assertDatabaseCount('events', 0);
    }

    public function test_duplicate_event_id_preserves_original_payload(): void
    {
        $payload = $this->payload();

        $this->postJson('/api/v1/events', $payload)
            ->assertStatus(202);

        $changedPayload = $payload;
        $changedPayload['event_name'] = 'different_event';
        $changedPayload['properties'] = ['changed' => true];

        $this->postJson('/api/v1/events', $changedPayload)
            ->assertStatus(202);

        $this->assertSame(1, Event::count());

        $this->assertDatabaseHas('events', [
            'event_id' => $payload['event_id'],
            'event_name' => 'test_event',
        ]);

        $this->assertDatabaseMissing('events', [
            'event_id' => $payload['event_id'],
            'event_name' => 'different_event',
        ]);
    }
}
