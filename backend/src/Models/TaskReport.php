<?php

namespace App\Models;

use App\Models\Eloquent\TaskReport as EloquentTaskReport;

class TaskReport
{
  public function findById(int $id): ?array
  {
    $report = EloquentTaskReport::with(['task', 'reporter'])
      ->find($id);
    
    if (!$report) {
      return null;
    }

    $result = $report->toArray();
    $result['reporter_name'] = $report->reporter ? $report->reporter->username : null;
    $result['task_title'] = $report->task ? $report->task->title : null;
    
    return $result;
  }

  public function getAll(array $filters = []): array
  {
    $page = $filters['page'] ?? 1;
    $limit = $filters['limit'] ?? 10;

    $query = EloquentTaskReport::with(['task', 'reporter']);

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['task_id'])) {
      $query->where('task_id', $filters['task_id']);
    }

    if (!empty($filters['search'])) {
      $query->where(function ($q) use ($filters) {
        $q->whereHas('task', function ($taskQuery) use ($filters) {
          $taskQuery->where('title', 'like', "%{$filters['search']}%");
        })->orWhereHas('reporter', function ($reporterQuery) use ($filters) {
          $reporterQuery->where('username', 'like', "%{$filters['search']}%");
        })->orWhere('reason', 'like', "%{$filters['search']}%");
      });
    }

    $total = $query->count();
    $reports = $query->orderBy('created_at', 'desc')
      ->skip(($page - 1) * $limit)
      ->take($limit)
      ->get()
      ->map(function ($report) {
        $array = $report->toArray();
        $array['reporter_name'] = $report->reporter ? $report->reporter->username : null;
        $array['task_title'] = $report->task ? $report->task->title : null;
        return $array;
      })
      ->toArray();

    return [
      'data' => $reports,
      'total' => $total,
      'page' => $page,
      'limit' => $limit,
      'pages' => ceil($total / $limit)
    ];
  }

  public function create(array $data): int
  {
    $report = EloquentTaskReport::create([
      'task_id' => $data['task_id'],
      'reporter_id' => $data['reporter_id'],
      'reason' => $data['reason'],
      'description' => $data['description'] ?? null,
      'status' => 'pending',
    ]);
    return $report->id;
  }

  public function updateStatus(int $id, string $status, ?string $adminNote = null): bool
  {
    $report = EloquentTaskReport::find($id);
    if (!$report) {
      return false;
    }

    $updateData = ['status' => $status];
    if ($adminNote !== null) {
      $updateData['admin_note'] = $adminNote;
    }

    return $report->update($updateData);
  }

  public function hasUserReported(int $taskId, int $userId): bool
  {
    return EloquentTaskReport::where('task_id', $taskId)
      ->where('reporter_id', $userId)
      ->exists();
  }

  public function getReasonOptions(): array
  {
    return [
      '违规内容',
      '虚假信息',
      '诈骗行为',
      '侵权内容',
      '其他'
    ];
  }
}
