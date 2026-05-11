<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'reports';

    protected $fillable = [
        'task_id',
        'reporter_id',
        'reason',
        'description',
        'status',
        'admin_note',
        'handled_by',
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
