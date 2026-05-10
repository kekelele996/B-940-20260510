<?php

namespace App\Controllers;

use App\Models\TaskReport;
use App\Models\Task;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class ReportController
{
  private TaskReport $reportModel;
  private Task $taskModel;

  public function __construct()
  {
    $this->reportModel = new TaskReport();
    $this->taskModel = new Task();
  }

  public function getReasons(): void
  {
    AuthMiddleware::requireAuth();
    Response::success($this->reportModel->getReasons());
  }

  public function create(int $taskId): void
  {
    $currentUser = AuthMiddleware::requireAuth();

    $task = $this->taskModel->findById($taskId);
    if (!$task) {
      Response::error('任务不存在', 404);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $reason = $data['reason'] ?? null;
    $description = $data['description'] ?? null;

    if (!$reason) {
      Response::error('请选择举报理由');
    }

    $validReasons = $this->reportModel->getReasons();
    if (!in_array($reason, $validReasons)) {
      Response::error('举报理由无效');
    }

    $id = $this->reportModel->create([
      'task_id' => $taskId,
      'reporter_id' => $currentUser['user_id'],
      'reason' => $reason,
      'description' => $description,
    ]);

    $report = $this->reportModel->findById($id);
    Response::success($report, '举报提交成功');
  }

  public function getReports(): void
  {
    AuthMiddleware::requireAdmin();

    $filters = [
      'page' => (int) ($_GET['page'] ?? 1),
      'limit' => (int) ($_GET['limit'] ?? 10),
      'status' => $_GET['status'] ?? null,
    ];

    $result = $this->reportModel->getAll($filters);
    Response::success($result);
  }

  public function resolve(int $reportId): void
  {
    $currentUser = AuthMiddleware::requireAdmin();

    $report = $this->reportModel->findById($reportId);
    if (!$report) {
      Response::error('举报不存在', 404);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $handleNote = $data['handle_note'] ?? null;

    $this->reportModel->updateStatus($reportId, 'resolved', $currentUser['user_id'], $handleNote);

    $updated = $this->reportModel->findById($reportId);
    Response::success($updated, '举报已处理');
  }

  public function reject(int $reportId): void
  {
    $currentUser = AuthMiddleware::requireAdmin();

    $report = $this->reportModel->findById($reportId);
    if (!$report) {
      Response::error('举报不存在', 404);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $handleNote = $data['handle_note'] ?? null;

    $this->reportModel->updateStatus($reportId, 'rejected', $currentUser['user_id'], $handleNote);

    $updated = $this->reportModel->findById($reportId);
    Response::success($updated, '举报已驳回');
  }

  public function removeTask(int $reportId): void
  {
    $currentUser = AuthMiddleware::requireAdmin();

    $report = $this->reportModel->findById($reportId);
    if (!$report) {
      Response::error('举报不存在', 404);
    }

    $task = $this->taskModel->findById($report['task_id']);
    if (!$task) {
      Response::error('关联任务不存在', 404);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $handleNote = $data['handle_note'] ?? null;

    $this->taskModel->updateStatus($report['task_id'], 'cancelled');
    $this->reportModel->updateStatus($reportId, 'resolved', $currentUser['user_id'], $handleNote ?? '任务已下架');

    $updated = $this->reportModel->findById($reportId);
    Response::success($updated, '任务已下架');
  }
}
