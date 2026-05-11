<?php

namespace App\Controllers;

use App\Models\Review;
use App\Models\Task;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class ReviewController
{
  private Review $reviewModel;
  private Task $taskModel;

  public function __construct()
  {
    $this->reviewModel = new Review();
    $this->taskModel = new Task();
  }

  public function create(int $taskId): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($taskId);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 只有任务发布者可以评价
    if ($task['publisher_id'] != $auth['user_id']) {
      Response::error('只有任务发布者可以评价', 403);
    }

    // 只有已完成的任务可以评价
    if ($task['status'] !== 'completed') {
      Response::error('只能评价已完成的任务');
    }

    // 检查是否已评价
    if ($this->reviewModel->findByTaskId($taskId)) {
      Response::error('该任务已评价');
    }

    // 必须有接单者才能评价
    if (!$task['worker_id']) {
      Response::error('该任务没有接单者');
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // 验证评分
    if (empty($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
      Response::error('评分必须在1-5之间');
    }

    $reviewId = $this->reviewModel->create([
      'task_id' => $taskId,
      'reviewer_id' => $auth['user_id'],
      'reviewee_id' => $task['worker_id'],
      'rating' => $data['rating'],
      'content' => $data['content'] ?? null
    ]);

    $review = $this->reviewModel->findByTaskId($taskId);
    Response::success($review, '评价成功');
  }

  public function getUserReviews(int $userId): void
  {
    $page = (int) ($_GET['page'] ?? 1);
    $limit = (int) ($_GET['limit'] ?? 10);

    $result = $this->reviewModel->getByUserId($userId, $page, $limit);
    $avgRating = $this->reviewModel->getAverageRating($userId);

    $result['avg_rating'] = $avgRating;
    Response::success($result);
  }
}
