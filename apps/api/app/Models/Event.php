<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    protected $fillable = [
        'project_id',
        'event_id',
        'event_name',
        'anonymous_id',
        'session_id',
        'user_id',
        'event_timestamp',
        'source',
        'properties',
    ];

    protected function casts(): array
    {
        return [
            'event_timestamp' => 'immutable_datetime',
            'properties' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
