<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';
    
    // 禁用 updated_at 字段（表中没有此字段）
    public $timestamps = false;
    
    // 只使用 created_at
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;
    
    protected $fillable = [
        'task_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'content',
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
    ];

    // 关联：任务
    public function task()
    {
        return $this->belongsTo(\App\Models\Eloquent\Task::class, 'task_id');
    }

    // 关联：评价者
    public function reviewer()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'reviewer_id');
    }

    // 关联：被评价者
    public function reviewee()
    {
        return $this->belongsTo(\App\Models\Eloquent\User::class, 'reviewee_id');
    }
}
