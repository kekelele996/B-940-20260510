<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Task;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class AdminController
{
  private User $userModel;
  private Task $taskModel;

  public function __construct()
  {
    $this->userModel = new User();
    $this->taskModel = new Task();
  }

  public function getUsers(): void
  {
    AuthMiddleware::requireAdmin();

    $page = (int) ($_GET['page'] ?? 1);
    $limit = (int) ($_GET['limit'] ?? 10);
    $search = $_GET['search'] ?? null;

    $result = $this->userModel->getAll($page, $limit, $search);
    Response::success($result);
  }

  public function updateUserStatus(int $id): void
  {
    AuthMiddleware::requireAdmin();

    $user = $this->userModel->findById($id);
    if (!$user) {
      Response::error('用户不存在', 404);
    }

    // 不能禁用管理员
    if ($user['role'] === 'admin') {
      Response::error('不能修改管理员状态');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $status = isset($data['status']) ? (int) $data['status'] : null;

    if ($status !== 0 && $status !== 1) {
      Response::error('状态值无效');
    }

    $this->userModel->updateStatus($id, $status);
    $updated = $this->userModel->findById($id);

    $message = $status === 1 ? '用户已启用' : '用户已禁用';
    Response::success($updated, $message);
  }

  public function getTasks(): void
  {
    AuthMiddleware::requireAdmin();

    $filters = [
      'page' => (int) ($_GET['page'] ?? 1),
      'limit' => (int) ($_GET['limit'] ?? 10),
      'status' => $_GET['status'] ?? null,
      'category' => $_GET['category'] ?? null,
      'search' => $_GET['search'] ?? null
    ];

    $result = $this->taskModel->getAll($filters);
    Response::success($result);
  }

  public function deleteTask(int $id): void
  {
    AuthMiddleware::requireAdmin();

    $task = $this->taskModel->findById($id);
    if (!$task) {
      Response::error('任务不存在', 404);
    }

    $this->taskModel->delete($id);
    Response::success(null, '任务删除成功');
  }

  public function getStats(): void
  {
    AuthMiddleware::requireAdmin();

    $db = \App\Config\Database::getConnection();

    // 获取统计数据
    $stats = [
      'total_users' => 0,
      'total_tasks' => 0,
      'pending_tasks' => 0,
      'completed_tasks' => 0
    ];

    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $stats['total_users'] = (int) $stmt->fetch()['count'];

    $stmt = $db->query("SELECT COUNT(*) as count FROM tasks");
    $stats['total_tasks'] = (int) $stmt->fetch()['count'];

    $stmt = $db->query("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");
    $stats['pending_tasks'] = (int) $stmt->fetch()['count'];

    $stmt = $db->query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    $stats['completed_tasks'] = (int) $stmt->fetch()['count'];

    Response::success($stats);
  }
}
