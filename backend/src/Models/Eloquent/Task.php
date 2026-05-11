<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'tasks';
    
    protected $fillable = [
        'title',
        'description',
        'category',
        'budget',
        'deadline',
        'skills',
        'status',
        'publisher_id',
        'worker_id',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'deadline' => 'date',
        'skills' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // 关联：发布者
    public function publisher()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'publisher_id');
    }

    // 关联：接单者
    public function worker()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'worker_id');
    }

    // 关联：提交记录
    public function submissions()
    {
        return $this->hasMany(\App\Models\Eloquent\TaskSubmission::class, 'task_id');
    }

    // 关联：评价
    public function review()
    {
        return $this->hasOne(\App\Models\Eloquent\Review::class, 'task_id');
    }

    // 获取最新提交
    public function latestSubmission()
    {
        return $this->hasOne(\App\Models\Eloquent\TaskSubmission::class, 'task_id')->latestOfMany();
    }
}
