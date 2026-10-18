<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(string $email = 'owner@example.com'): Admin
    {
        return Admin::create([
            'name' => 'Test Owner',
            'email' => $email,
            'password' => Hash::make('TestPassword123!'),
            'is_active' => true,
        ]);
    }

    public function test_admin_can_login(): void
    {
        $this->createAdmin();

        $this->postJson('/api/v1/admin/login', [
            'email' => 'owner@example.com',
            'password' => 'TestPassword123!',
        ])
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'admin' => ['id', 'name', 'email'],
            ]);
    }

    public function test_admin_can_only_see_their_own_projects(): void
    {
        $admin = $this->createAdmin();
        $otherAdmin = $this->createAdmin('other@example.com');

        Project::create([
            'admin_id' => $admin->id,
            'name' => 'My Website',
            'public_key' => 'pk_my_website',
            'server_key_hash' => hash('sha256', 'my-server-key'),
        ]);

        Project::create([
            'admin_id' => $otherAdmin->id,
            'name' => 'Other Website',
            'public_key' => 'pk_other_website',
            'server_key_hash' => hash('sha256', 'other-server-key'),
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/projects')
            ->assertOk()
            ->assertJsonCount(1, 'projects')
            ->assertJsonPath('projects.0.name', 'My Website')
            ->assertJsonMissing(['name' => 'Other Website'])
            ->assertJsonMissingPath('projects.0.server_key_hash');
    }

    public function test_unauthenticated_user_cannot_list_projects(): void
    {
        $this->getJson('/api/v1/admin/projects')
            ->assertUnauthorized();
    }

    public function test_regular_customer_cannot_list_admin_projects(): void
    {
        $customer = User::factory()->create();

        Sanctum::actingAs($customer);

        $this->getJson('/api/v1/admin/projects')
            ->assertForbidden();
    }

    public function test_inactive_admin_cannot_login(): void
    {
        $admin = $this->createAdmin();
        $admin->update(['is_active' => false]);

        $this->postJson('/api/v1/admin/login', [
            'email' => 'owner@example.com',
            'password' => 'TestPassword123!',
        ])->assertUnprocessable();
    }



    public function test_admin_can_create_project_with_generated_public_key(): void
    {
        $admin = $this->createAdmin();

        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/projects', [
            'name' => 'My New Website',
        ])
            ->assertCreated()
            ->assertJsonPath('message', 'Project created successfully.')
            ->assertJsonPath('project.name', 'My New Website')
            ->assertJsonPath('project.id', fn ($id) => is_int($id))
            ->assertJsonPath(
                'project.public_key',
                fn ($key) => is_string($key)
                    && preg_match('/^pk_[a-f0-9]{32}$/', $key) === 1
            );

        $this->assertDatabaseHas('projects', [
            'admin_id' => $admin->id,
            'name' => 'My New Website',
        ]);
    }

    public function test_unauthenticated_user_cannot_create_project(): void
    {
        $this->postJson('/api/v1/admin/projects', [
            'name' => 'Unauthorized Project',
        ])->assertUnauthorized();
    }

    public function test_admin_cannot_create_project_without_a_valid_name(): void
    {
        $admin = $this->createAdmin();

        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/projects', [
            'name' => '',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors(['name']);
    }

}
