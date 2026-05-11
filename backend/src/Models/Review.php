<?php

namespace App\Models;

use App\Models\Eloquent\Review as EloquentReview;

class Review
{
  public function findByTaskId(int $taskId): ?array
  {
    $review = EloquentReview::with(['reviewer', 'reviewee'])
      ->where('task_id', $taskId)
      ->first();
    
    if (!$review) {
      return null;
    }

    $result = $review->toArray();
    $result['reviewer_name'] = $review->reviewer ? $review->reviewer->username : null;
    $result['reviewee_name'] = $review->reviewee ? $review->reviewee->username : null;
    
    return $result;
  }

  public function getByUserId(int $userId, int $page = 1, int $limit = 10): array
  {
    $query = EloquentReview::with(['task', 'reviewer'])
      ->where('reviewee_id', $userId);

    $total = $query->count();
    $reviews = $query->orderBy('created_at', 'desc')
      ->skip(($page - 1) * $limit)
      ->take($limit)
      ->get()
      ->map(function ($review) {
        $array = $review->toArray();
        $array['task_title'] = $review->task ? $review->task->title : null;
        $array['reviewer_name'] = $review->reviewer ? $review->reviewer->username : null;
        return $array;
      })
      ->toArray();

    return [
      'data' => $reviews,
      'total' => $total,
      'page' => $page,
      'limit' => $limit,
      'pages' => ceil($total / $limit)
    ];
  }

  public function create(array $data): int
  {
    $review = EloquentReview::create([
      'task_id' => $data['task_id'],
      'reviewer_id' => $data['reviewer_id'],
      'reviewee_id' => $data['reviewee_id'],
      'rating' => $data['rating'],
      'content' => $data['content'] ?? null,
    ]);
    return $review->id;
  }

  public function getAverageRating(int $userId): float
  {
    $avg = EloquentReview::where('reviewee_id', $userId)
      ->avg('rating');
    return round((float) ($avg ?? 0), 1);
  }
}
