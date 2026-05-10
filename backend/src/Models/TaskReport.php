<?php

namespace App\Models;

use App\Models\Eloquent\TaskReport as EloquentTaskReport;

class TaskReport
{
  public function findById(int $id): ?array
  {
    $report = EloquentTaskReport::with(['task', 'reporter', 'handler'])
      ->find($id);

    if (!$report) {
      return null;
    }

    $result = $report->toArray();
    $result['reporter_name'] = $report->reporter ? $report->reporter->username : null;
    $result['handler_name'] = $report->handler ? $report->handler->username : null;
    $result['task_title'] = $report->task ? $report->task->title : null;

    return $result;
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

  public function getAll(array $filters = []): array
  {
    $page = $filters['page'] ?? 1;
    $limit = $filters['limit'] ?? 10;

    $query = EloquentTaskReport::with(['task', 'reporter', 'handler']);

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['task_id'])) {
      $query->where('task_id', $filters['task_id']);
    }

    if (!empty($filters['reporter_id'])) {
      $query->where('reporter_id', $filters['reporter_id']);
    }

    $query->orderBy('created_at', 'desc');

    $total = $query->count();
    $reports = $query->skip(($page - 1) * $limit)
      ->take($limit)
      ->get()
      ->map(function ($report) {
        $array = $report->toArray();
        $array['reporter_name'] = $report->reporter ? $report->reporter->username : null;
        $array['handler_name'] = $report->handler ? $report->handler->username : null;
        $array['task_title'] = $report->task ? $report->task->title : null;
        $array['task_status'] = $report->task ? $report->task->status : null;
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

  public function updateStatus(int $id, string $status, int $handledBy, ?string $handleNote = null): bool
  {
    $report = EloquentTaskReport::find($id);
    if (!$report) {
      return false;
    }

    $updateData = [
      'status' => $status,
      'handled_by' => $handledBy,
    ];

    if ($handleNote !== null) {
      $updateData['handle_note'] = $handleNote;
    }

    return $report->update($updateData);
  }

  public function getReasons(): array
  {
    return [
      '违规内容',
      '虚假信息',
      '低质内容',
      '恶意行为',
      '其他'
    ];
  }
}
