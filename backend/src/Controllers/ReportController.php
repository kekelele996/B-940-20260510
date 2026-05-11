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

  public function getReasonOptions(): void
  {
    $options = $this->reportModel->getReasonOptions();
    Response::success($options);
  }

  public function create(int $taskId): void
  {
    $auth = AuthMiddleware::requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    $task = $this->taskModel->findById($taskId);
    if (!$task) {
      Response::error('任务不存在', 404);
    }

    if (empty($data['reason'])) {
      Response::error('请选择举报理由');
    }

    $allowedReasons = $this->reportModel->getReasonOptions();
    if (!in_array($data['reason'], $allowedReasons)) {
      Response::error('非法的举报理由');
    }

    if ($this->reportModel->hasUserReported($taskId, $auth['user_id'])) {
      Response::error('您已经举报过此任务');
    }

    $reportId = $this->reportModel->create([
      'task_id' => $taskId,
      'reporter_id' => $auth['user_id'],
      'reason' => $data['reason'],
      'description' => $data['description'] ?? null,
    ]);

    $report = $this->reportModel->findById($reportId);
    Response::success($report, '举报提交成功');
  }

  public function index(): void
  {
    AuthMiddleware::requireAdmin();

    $filters = [
      'page' => (int) ($_GET['page'] ?? 1),
      'limit' => (int) ($_GET['limit'] ?? 10),
      'status' => $_GET['status'] ?? null,
      'search' => $_GET['search'] ?? null,
    ];

    $result = $this->reportModel->getAll($filters);
    Response::success($result);
  }

  public function show(int $id): void
  {
    AuthMiddleware::requireAdmin();

    $report = $this->reportModel->findById($id);
    if (!$report) {
      Response::error('举报不存在', 404);
    }

    Response::success($report);
  }

  public function resolve(int $id): void
  {
    AuthMiddleware::requireAdmin();

    $report = $this->reportModel->findById($id);
    if (!$report) {
      Response::error('举报不存在', 404);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $adminNote = $data['admin_note'] ?? null;

    $this->taskModel->updateStatus($report['task_id'], 'removed');

    $this->reportModel->updateStatus($id, 'resolved', $adminNote);
    $updated = $this->reportModel->findById($id);

    Response::success($updated, '举报已处理，任务已下架');
  }

  public function reject(int $id): void
  {
    AuthMiddleware::requireAdmin();

    $report = $this->reportModel->findById($id);
    if (!$report) {
      Response::error('举报不存在', 404);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $adminNote = $data['admin_note'] ?? null;

    $this->reportModel->updateStatus($id, 'rejected', $adminNote);
    $updated = $this->reportModel->findById($id);

    Response::success($updated, '举报已驳回');
  }

  public function stats(): void
  {
    AuthMiddleware::requireAdmin();

    $stats = [
      'pending' => 0,
      'resolved' => 0,
      'rejected' => 0,
      'total' => 0,
    ];

    $results = \App\Models\Eloquent\TaskReport::selectRaw('status, COUNT(*) as count')
      ->groupBy('status')
      ->get();

    foreach ($results as $row) {
      $stats[$row->status] = (int) $row->count;
      $stats['total'] += (int) $row->count;
    }

    Response::success($stats);
  }
}
