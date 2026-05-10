<?php

namespace App\Models;

use App\Models\Eloquent\TaskSubmission as EloquentTaskSubmission;

class TaskSubmission
{
  public function findByTaskId(int $taskId): ?array
  {
    $submission = EloquentTaskSubmission::where('task_id', $taskId)
      ->orderBy('created_at', 'desc')
      ->first();
    return $submission ? $submission->toArray() : null;
  }

  public function create(array $data): int
  {
    $submission = EloquentTaskSubmission::create([
      'task_id' => $data['task_id'],
      'content' => $data['content'],
      'attachment_url' => $data['attachment_url'] ?? null,
    ]);
    return $submission->id;
  }
}
