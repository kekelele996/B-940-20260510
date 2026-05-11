<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

class TaskReport extends Model
{
    protected $table = 'task_reports';

    protected $fillable = [
        'task_id',
        'reporter_id',
        'reason',
        'description',
        'status',
        'handled_by',
        'handle_note',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(\App\Models\Eloquent\Task::class, 'task_id');
    }

    public function reporter()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'reporter_id');
    }

    public function handler()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'handled_by');
    }
}
