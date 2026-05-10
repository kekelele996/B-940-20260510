<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\Response;
use App\Utils\JWT;

class AuthController
{
  private User $userModel;

  public function __construct()
  {
    $this->userModel = new User();
  }

  public function register(): void
  {
    $data = json_decode(file_get_contents('php://input'), true);

    // 验证必填字段
    if (empty($data['username']) || empty($data['password']) || empty($data['email'])) {
      Response::error('用户名、密码和邮箱为必填项');
    }

    // 验证用户名长度
    if (strlen($data['username']) < 3 || strlen($data['username']) > 50) {
      Response::error('用户名长度应在3-50个字符之间');
    }

    // 验证密码长度
    if (strlen($data['password']) < 6) {
      Response::error('密码长度至少6位');
    }

    // 验证邮箱格式
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      Response::error('邮箱格式不正确');
    }

    // 检查用户名是否已存在
    if ($this->userModel->findByUsername($data['username'])) {
      Response::error('用户名已被使用');
    }

    // 检查邮箱是否已存在
    if ($this->userModel->findByEmail($data['email'])) {
      Response::error('邮箱已被注册');
    }

    // 创建用户
    $userId = $this->userModel->create($data);
    $user = $this->userModel->findById($userId);

    // 生成Token
    $token = JWT::encode([
      'user_id' => $user['id'],
      'username' => $user['username'],
      'role' => $user['role']
    ]);

    Response::success([
      'user' => $user,
      'token' => $token
    ], '注册成功');
  }

  public function login(): void
  {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['username']) || empty($data['password'])) {
      Response::error('用户名和密码为必填项');
    }

    // 查找用户 (支持用户名或邮箱登录)
    $user = $this->userModel->findByUsername($data['username']);
    if (!$user) {
      $user = $this->userModel->findByEmail($data['username']);
    }

    if (!$user) {
      Response::error('用户名或密码错误');
    }

    // 检查用户状态
    if ($user['status'] == 0) {
      Response::error('账号已被禁用，请联系管理员');
    }

    // 验证密码
    if (!$this->userModel->verifyPassword($user, $data['password'])) {
      Response::error('用户名或密码错误');
    }

    // 生成Token
    $token = JWT::encode([
      'user_id' => $user['id'],
      'username' => $user['username'],
      'role' => $user['role']
    ]);

    // 移除敏感信息
    unset($user['password_hash']);

    Response::success([
      'user' => $user,
      'token' => $token
    ], '登录成功');
  }

  public function me(): void
  {
    $auth = \App\Middleware\AuthMiddleware::requireAuth();
    $user = $this->userModel->findById($auth['user_id']);

    if (!$user) {
      Response::error('用户不存在', 404);
    }

    Response::success($user);
  }

  public function logout(): void
  {
    Response::success(null, '退出成功');
  }
}
