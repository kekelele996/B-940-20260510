<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    
    protected $fillable = [
        'username',
        'password_hash',
        'email',
        'phone',
        'role',
        'status',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'status' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // 关联：发布的任务
    public function publishedTasks()
    {
        return $this->hasMany(\App\Models\Eloquent\Task::class, 'publisher_id');
    }

    // 关联：接受的任务
    public function acceptedTasks()
    {
        return $this->hasMany(\App\Models\Eloquent\Task::class, 'worker_id');
    }

    // 关联：收到的评价
    public function receivedReviews()
    {
        return $this->hasMany(\App\Models\Eloquent\Review::class, 'reviewee_id');
    }

    // 关联：给出的评价
    public function givenReviews()
    {
        return $this->hasMany(\App\Models\Eloquent\Review::class, 'reviewer_id');
    }
}
