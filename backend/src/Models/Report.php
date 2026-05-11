<?php

namespace App\Models;

use App\Models\Eloquent\Report as EloquentReport;

class Report
{
  public function create(array $data): int
  {
    $report = EloquentReport::create([
      'task_id' => $data['task_id'],
      'reporter_id' => $data['reporter_id'],
      'reason' => $data['reason'],
      'description' => $data['description'] ?? null,
      'status' => 'pending',
    ]);
    return $report->id;
  }

  public function findByTaskAndReporter(int $taskId, int $reporterId): ?array
  {
    $report = EloquentReport::where('task_id', $taskId)
      ->where('reporter_id', $reporterId)
      ->where('status', 'pending')
      ->first();

    if (!$report) {
      return null;
    }

    return $report->toArray();
  }

  public function getAll(array $filters = []): array
  {
    $page = $filters['page'] ?? 1;
    $limit = $filters['limit'] ?? 10;

    $query = EloquentReport::with(['task', 'reporter', 'handler']);

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    $total = $query->count();
    $reports = $query->orderBy('created_at', 'desc')
      ->skip(($page - 1) * $limit)
      ->take($limit)
      ->get()
      ->map(function ($report) {
        $array = $report->toArray();
        $array['task_title'] = $report->task ? $report->task->title : null;
        $array['reporter_name'] = $report->reporter ? $report->reporter->username : null;
        $array['handler_name'] = $report->handler ? $report->handler->username : null;
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

  public function findById(int $id): ?array
  {
    $report = EloquentReport::with(['task', 'reporter', 'handler'])->find($id);

    if (!$report) {
      return null;
    }

    $result = $report->toArray();
    $result['task_title'] = $report->task ? $report->task->title : null;
    $result['reporter_name'] = $report->reporter ? $report->reporter->username : null;
    $result['handler_name'] = $report->handler ? $report->handler->username : null;

    return $result;
  }

  public function update(int $id, array $data): bool
  {
    $report = EloquentReport::find($id);
    if (!$report) {
      return false;
    }
    return $report->update($data);
  }
}
