<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

public function up(): void
{
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->foreignId('project_id')
            ->constrained()
            ->cascadeOnDelete();

        $table->uuid('event_id');
        $table->string('event_name', 100);
        $table->string('anonymous_id', 100);
        $table->string('session_id', 100);
        $table->string('user_id')->nullable();

        $table->timestampTz('event_timestamp');
        $table->string('source', 20)->default('browser');
        $table->jsonb('properties')->default('{}');

        $table->timestamps();
        $table->unique(['project_id', 'event_id']);
        $table->index(['project_id', 'event_timestamp']);
        $table->index([
            'project_id',
            'event_name',
                    'event_timestamp'
                ]);
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('events');
        }

};
