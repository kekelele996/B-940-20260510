<?php

namespace App\Middleware;

use App\Utils\JWT;
use App\Utils\Response;

class AuthMiddleware
{
  public static function authenticate(): ?array
  {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader)) {
      return null;
    }

    if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
      return null;
    }

    $token = $matches[1];
    $payload = JWT::decode($token);

    if ($payload === null) {
      return null;
    }

    return $payload;
  }

  public static function requireAuth(): array
  {
    $user = self::authenticate();
    if ($user === null) {
      Response::error('未授权访问，请先登录', 401);
    }
    return $user;
  }

  public static function requireAdmin(): array
  {
    $user = self::requireAuth();
    if ($user['role'] !== 'admin') {
      Response::error('需要管理员权限', 403);
    }
    return $user;
  }
}
