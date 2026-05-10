<?php

namespace App\Models;

use App\Models\Eloquent\Task as EloquentTask;

class Task
{
  public function findById(int $id): ?array
  {
    $task = EloquentTask::with(['publisher', 'worker', 'review'])
      ->find($id);
    
    if (!$task) {
      return null;
    }

    $result = $task->toArray();
    $result['publisher_name'] = $task->publisher ? $task->publisher->username : null;
    $result['publisher_email'] = $task->publisher ? $task->publisher->email : null;
    $result['worker_name'] = $task->worker ? $task->worker->username : null;
    $result['worker_email'] = $task->worker ? $task->worker->email : null;
    
    if ($task->review) {
      $result['rating'] = $task->review->rating;
      $result['review_content'] = $task->review->content;
    }

    return $result;
  }

  public function getAll(array $filters = []): array
  {
    $page = $filters['page'] ?? 1;
    $limit = $filters['limit'] ?? 10;

    $query = EloquentTask::with('publisher');

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['category'])) {
      $query->where('category', $filters['category']);
    }

    if (!empty($filters['search'])) {
      $query->where(function ($q) use ($filters) {
        $q->where('title', 'like', "%{$filters['search']}%")
          ->orWhere('description', 'like', "%{$filters['search']}%");
      });
    }

    if (!empty($filters['publisher_id'])) {
      $query->where('publisher_id', $filters['publisher_id']);
    }

    if (!empty($filters['worker_id'])) {
      $query->where('worker_id', $filters['worker_id']);
    }

    // 排序
    if (!empty($filters['sort'])) {
      switch ($filters['sort']) {
        case 'budget_asc':
          $query->orderBy('budget', 'asc');
          break;
        case 'budget_desc':
          $query->orderBy('budget', 'desc');
          break;
        case 'deadline':
          $query->orderBy('deadline', 'asc');
          break;
        default:
          $query->orderBy('created_at', 'desc');
      }
    } else {
      $query->orderBy('created_at', 'desc');
    }

    $total = $query->count();
    $tasks = $query->skip(($page - 1) * $limit)
      ->take($limit)
      ->get()
      ->map(function ($task) {
        $array = $task->toArray();
        $array['publisher_name'] = $task->publisher ? $task->publisher->username : null;
        return $array;
      })
      ->toArray();

    return [
      'data' => $tasks,
      'total' => $total,
      'page' => $page,
      'limit' => $limit,
      'pages' => ceil($total / $limit)
    ];
  }

  public function create(array $data): int
  {
    $task = EloquentTask::create([
      'title' => $data['title'],
      'description' => $data['description'],
      'category' => $data['category'],
      'budget' => $data['budget'],
      'deadline' => $data['deadline'],
      'skills' => $data['skills'] ?? [],
      'publisher_id' => $data['publisher_id'],
      'status' => 'pending',
    ]);
    return $task->id;
  }

  public function update(int $id, array $data): bool
  {
    $task = EloquentTask::find($id);
    if (!$task) {
      return false;
    }

    $updateData = [];
    foreach (['title', 'description', 'category', 'budget', 'deadline'] as $field) {
      if (isset($data[$field])) {
        $updateData[$field] = $data[$field];
      }
    }

    if (isset($data['skills'])) {
      $updateData['skills'] = $data['skills'];
    }

    if (empty($updateData)) {
      return false;
    }

    return $task->update($updateData);
  }

  public function delete(int $id): bool
  {
    $task = EloquentTask::find($id);
    if (!$task) {
      return false;
    }
    return $task->delete();
  }

  public function updateStatus(int $id, string $status, ?int $workerId = null): bool
  {
    $task = EloquentTask::find($id);
    if (!$task) {
      return false;
    }

    $updateData = ['status' => $status];
    if ($workerId !== null) {
      $updateData['worker_id'] = $workerId;
    }

    return $task->update($updateData);
  }

  public function getCategories(): array
  {
    return [
      '技术开发',
      '设计创意',
      '文案写作',
      '数据处理',
      '翻译服务',
      '其他'
    ];
  }
}
