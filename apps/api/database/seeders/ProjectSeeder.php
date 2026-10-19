<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Project;
use Illuminate\Database\Seeder;
use RuntimeException;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $publicKey = config('app.pulsetrack_public_key');
        $serverKey = config('app.pulsetrack_server_key');
        $adminEmail = config('app.pulsetrack_admin_email');

        if (!$publicKey || !$serverKey || !$adminEmail) {
            throw new RuntimeException(
                'PULSETRACK_PUBLIC_KEY, PULSETRACK_SERVER_KEY, and PULSETRACK_ADMIN_EMAIL must be configured.'
            );
        }

        $admin = Admin::query()
            ->where('email', $adminEmail)
            ->where('is_active', true)
            ->first();

        if (!$admin) {
            throw new RuntimeException(
                "No active admin found for email: {$adminEmail}. Create the admin before seeding projects."
            );
        }

        Project::updateOrCreate(
            ['public_key' => $publicKey],
            [
                'admin_id' => $admin->id,
                'name' => 'Restaurant Demo',
                'server_key_hash' => $serverKey,
            ]
        );
    }
}
