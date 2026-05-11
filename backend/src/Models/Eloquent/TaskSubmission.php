<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

class TaskSubmission extends Model
{
    protected $table = 'task_submissions';
    
    // 禁用 updated_at 字段（表中没有此字段）
    public $timestamps = false;
    
    // 只使用 created_at
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;
    
    protected $fillable = [
        'task_id',
        'content',
        'attachment_url',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // 关联：任务
    public function task()
    {
        return $this->belongsTo(\App\Models\Eloquent\Task::class, 'task_id');
    }
}
