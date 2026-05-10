<?php

require_once __DIR__ . '/../vendor/autoload.php';

// 初始化 Eloquent ORM
use App\Config\Eloquent;
Eloquent::initialize();

// 设置错误处理
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 全局异常处理
set_exception_handler(function ($exception) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => '服务器内部错误',
        'error' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => getenv('APP_DEBUG') === 'true' ? $exception->getTraceAsString() : null
    ], JSON_UNESCAPED_UNICODE);
    exit;
});

// 错误处理
set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

use App\Utils\Response;
use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\UserController;
use App\Controllers\ReviewController;
use App\Controllers\AdminController;

// 获取请求路径和方法
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// 移除查询字符串
$path = parse_url($requestUri, PHP_URL_PATH);

// 移除前缀
$path = preg_replace('#^/api#', '', $path);

// 路由表
$routes = [
  // 健康检查
  'GET /health' => function () {
    Response::success(['status' => 'ok', 'time' => date('Y-m-d H:i:s')]);
  },

  // 认证路由
  'POST /auth/register' => [AuthController::class, 'register'],
  'POST /auth/login' => [AuthController::class, 'login'],
  'POST /auth/logout' => [AuthController::class, 'logout'],
  'GET /auth/me' => [AuthController::class, 'me'],

  // 任务路由
  'GET /tasks' => [TaskController::class, 'index'],
  'GET /tasks/categories' => [TaskController::class, 'categories'],
  'GET /tasks/my-published' => [TaskController::class, 'myPublished'],
  'GET /tasks/my-accepted' => [TaskController::class, 'myAccepted'],
  'POST /tasks' => [TaskController::class, 'create'],

  // 用户路由
  'GET /users/:id/reviews' => [ReviewController::class, 'getUserReviews'],

  // 管理员路由
  'GET /admin/users' => [AdminController::class, 'getUsers'],
  'GET /admin/tasks' => [AdminController::class, 'getTasks'],
  'GET /admin/stats' => [AdminController::class, 'getStats'],
];

// 带参数的路由
$paramRoutes = [
  'GET /tasks/:id' => [TaskController::class, 'show'],
  'PUT /tasks/:id' => [TaskController::class, 'update'],
  'DELETE /tasks/:id' => [TaskController::class, 'delete'],
  'POST /tasks/:id/accept' => [TaskController::class, 'accept'],
  'POST /tasks/:id/submit' => [TaskController::class, 'submit'],
  'POST /tasks/:id/complete' => [TaskController::class, 'complete'],
  'POST /tasks/:id/cancel' => [TaskController::class, 'cancel'],
  'POST /tasks/:id/review' => [ReviewController::class, 'create'],

  'GET /users/:id' => [UserController::class, 'show'],
  'PUT /users/:id' => [UserController::class, 'update'],
  'GET /users/:id/reviews' => [ReviewController::class, 'getUserReviews'],

  'PUT /admin/users/:id/status' => [AdminController::class, 'updateUserStatus'],
  'DELETE /admin/tasks/:id' => [AdminController::class, 'deleteTask'],
];

// 匹配路由
$routeKey = "{$requestMethod} {$path}";

// 先尝试精确匹配
if (isset($routes[$routeKey])) {
  $handler = $routes[$routeKey];
  if (is_callable($handler)) {
    $handler();
  } else {
    $controller = new $handler[0]();
    $controller->{$handler[1]}();
  }
  exit;
}

// 尝试参数路由匹配
foreach ($paramRoutes as $pattern => $handler) {
  list($method, $routePath) = explode(' ', $pattern, 2);

  if ($method !== $requestMethod) {
    continue;
  }

  // 将 :id 转换为正则
  $regex = preg_replace('#:(\w+)#', '(\d+)', $routePath);
  $regex = "#^{$regex}$#";

  if (preg_match($regex, $path, $matches)) {
    array_shift($matches); // 移除完整匹配

    $controller = new $handler[0]();
    $controller->{$handler[1]}((int) $matches[0]);
    exit;
  }
}

// 404
Response::error('接口不存在', 404);
