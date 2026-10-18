<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Customer columns are created by the orders table migration.
    }

    public function down(): void
    {
        // Intentionally empty: customer columns belong to the orders table.
    }
};