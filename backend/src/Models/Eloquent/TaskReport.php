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
        'admin_note',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // 关联：任务
    public function task()
    {
        return $this->belongsTo(\App\Models\Eloquent\Task::class, 'task_id');
    }

    // 关联：举报人
    public function reporter()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'reporter_id');
    }
}
