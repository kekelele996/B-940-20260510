<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Review;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class UserController
{
  private User $userModel;
  private Review $reviewModel;

  public function __construct()
  {
    $this->userModel = new User();
    $this->reviewModel = new Review();
  }

  public function show(int $id): void
  {
    $user = $this->userModel->findById($id);

    if (!$user) {
      Response::error('用户不存在', 404);
    }

    // 获取平均评分
    $user['avg_rating'] = $this->reviewModel->getAverageRating($id);

    Response::success($user);
  }

  public function update(int $id): void
  {
    $auth = AuthMiddleware::requireAuth();

    // 只能编辑自己的信息
    if ($auth['user_id'] != $id) {
      Response::error('没有权限编辑此用户', 403);
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // 过滤允许更新的字段
    $allowedFields = ['email', 'phone'];
    $updateData = array_intersect_key($data, array_flip($allowedFields));

    if (empty($updateData)) {
      Response::error('没有可更新的字段');
    }

    // 验证邮箱格式
    if (isset($updateData['email']) && !filter_var($updateData['email'], FILTER_VALIDATE_EMAIL)) {
      Response::error('邮箱格式不正确');
    }

    $this->userModel->update($id, $updateData);
    $user = $this->userModel->findById($id);

    Response::success($user, '更新成功');
  }
}
