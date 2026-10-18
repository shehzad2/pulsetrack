<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.pulsetrack_admin_email');
        $password = config('app.pulsetrack_admin_password');

        if (!$email || !$password || strlen($password) < 12) {
            throw new RuntimeException(
                'Configure PULSETRACK_ADMIN_EMAIL and a password of at least 12 characters.'
            );
        }

        Admin::firstOrCreate(
            ['email' => strtolower($email)],
            [
                'name' => 'PulseTrack Demo Admin',
                'password' => $password,
                'is_active' => true,
            ]
        );
    }
}
