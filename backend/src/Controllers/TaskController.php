<?php

namespace App\Controllers;

use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\Review;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class TaskController
{
  private Task $taskModel;
  private TaskSubmission $submissionModel;
  private Review $reviewModel;

  public function __construct()
  {
    $this->taskModel = new Task();
    $this->submissionModel = new TaskSubmission();
    $this->reviewModel = new Review();
  }

  public function index(): void
  {
    $filters = [
      'page' => (int) ($_GET['page'] ?? 1),
      'limit' => (int) ($_GET['limit'] ?? 10),
      'status' => $_GET['status'] ?? null,
      'category' => $_GET['category'] ?? null,
      'search' => $_GET['search'] ?? null,
      'sort' => $_GET['sort'] ?? null
    ];

    $result = $this->taskModel->getAll($filters);
    Response::success($result);
  }

  public function show(int $id): void
  {
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 获取提交信息
    $submission = $this->submissionModel->findByTaskId($id);
    if ($submission) {
      $task['submission'] = $submission;
    }

    Response::success($task);
  }

  public function create(): void
  {
    $auth = AuthMiddleware::requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    // 验证必填字段
    $required = ['title', 'description', 'category', 'budget', 'deadline'];
    foreach ($required as $field) {
      if (empty($data[$field])) {
        Response::error("{$field} 为必填项");
      }
    }

    // 验证预算
    if (!is_numeric($data['budget']) || $data['budget'] <= 0) {
      Response::error('预算必须大于0');
    }

    // 验证截止日期
    if (strtotime($data['deadline']) < strtotime('today')) {
      Response::error('截止日期不能早于今天');
    }

    $data['publisher_id'] = $auth['user_id'];
    $taskId = $this->taskModel->create($data);
    $task = $this->taskModel->findById($taskId);

    Response::success($task, '任务创建成功');
  }

  public function update(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 只有发布者或管理员可以编辑
    if ($task['publisher_id'] != $auth['user_id'] && $auth['role'] !== 'admin') {
      Response::error('没有权限编辑此任务', 403);
    }

    // 只有待接单状态可以编辑
    if ($task['status'] !== 'pending') {
      Response::error('任务已被接单，无法编辑');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $this->taskModel->update($id, $data);
    $updated = $this->taskModel->findById($id);

    Response::success($updated, '任务更新成功');
  }

  public function delete(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 只有发布者或管理员可以删除
    if ($task['publisher_id'] != $auth['user_id'] && $auth['role'] !== 'admin') {
      Response::error('没有权限删除此任务', 403);
    }

    $this->taskModel->delete($id);
    Response::success(null, '任务删除成功');
  }

  public function accept(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 不能接受自己发布的任务
    if ($task['publisher_id'] == $auth['user_id']) {
      Response::error('不能接受自己发布的任务');
    }

    // 只有待接单状态可以接单
    if ($task['status'] !== 'pending') {
      Response::error('该任务已被接单或已完成');
    }

    $this->taskModel->updateStatus($id, 'in_progress', $auth['user_id']);
    $updated = $this->taskModel->findById($id);

    Response::success($updated, '接单成功');
  }

  public function submit(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 只有接单者可以提交
    if ($task['worker_id'] != $auth['user_id']) {
      Response::error('只有接单者可以提交任务', 403);
    }

    // 只有进行中状态可以提交
    if ($task['status'] !== 'in_progress') {
      Response::error('当前任务状态无法提交');
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['content'])) {
      Response::error('提交内容不能为空');
    }

    // 创建提交记录
    $this->submissionModel->create([
      'task_id' => $id,
      'content' => $data['content'],
      'attachment_url' => $data['attachment_url'] ?? null
    ]);

    // 更新任务状态
    $this->taskModel->updateStatus($id, 'submitted');
    $updated = $this->taskModel->findById($id);

    Response::success($updated, '任务提交成功，等待验收');
  }

  public function complete(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 只有发布者可以确认完成
    if ($task['publisher_id'] != $auth['user_id']) {
      Response::error('只有任务发布者可以确认完成', 403);
    }

    // 只有已提交状态可以确认完成
    if ($task['status'] !== 'submitted') {
      Response::error('当前任务状态无法确认完成');
    }

    $this->taskModel->updateStatus($id, 'completed');
    $updated = $this->taskModel->findById($id);

    Response::success($updated, '任务已完成');
  }

  public function cancel(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();
    $task = $this->taskModel->findById($id);

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // 只有发布者可以取消
    if ($task['publisher_id'] != $auth['user_id'] && $auth['role'] !== 'admin') {
      Response::error('没有权限取消此任务', 403);
    }

    // 已完成的任务不能取消
    if ($task['status'] === 'completed') {
      Response::error('已完成的任务无法取消');
    }

    $this->taskModel->updateStatus($id, 'cancelled');
    Response::success(null, '任务已取消');
  }

  public function categories(): void
  {
    $categories = $this->taskModel->getCategories();
    Response::success($categories);
  }

  public function myPublished(): void
  {
    $auth = AuthMiddleware::requireAuth();

    $filters = [
      'page' => (int) ($_GET['page'] ?? 1),
      'limit' => (int) ($_GET['limit'] ?? 10),
      'publisher_id' => $auth['user_id'],
      'status' => $_GET['status'] ?? null
    ];

    $result = $this->taskModel->getAll($filters);
    Response::success($result);
  }

  public function myAccepted(): void
  {
    $auth = AuthMiddleware::requireAuth();

    $filters = [
      'page' => (int) ($_GET['page'] ?? 1),
      'limit' => (int) ($_GET['limit'] ?? 10),
      'worker_id' => $auth['user_id'],
      'status' => $_GET['status'] ?? null
    ];

    $result = $this->taskModel->getAll($filters);
    Response::success($result);
  }
}
