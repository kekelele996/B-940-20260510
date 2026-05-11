<?php

namespace App\Models;

use App\Models\Eloquent\User as EloquentUser;

class User
{
  public function findByUsername(string $username): ?array
  {
    $user = EloquentUser::where('username', $username)->first();
    return $user ? $user->toArray() : null;
  }

  public function findByEmail(string $email): ?array
  {
    $user = EloquentUser::where('email', $email)->first();
    return $user ? $user->toArray() : null;
  }

  public function findById(int $id): ?array
  {
    $user = EloquentUser::select('id', 'username', 'email', 'phone', 'role', 'status', 'created_at')
      ->find($id);
    return $user ? $user->toArray() : null;
  }

  public function create(array $data): int
  {
    $user = EloquentUser::create([
      'username' => $data['username'],
      'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
      'email' => $data['email'],
      'phone' => $data['phone'] ?? null,
      'role' => $data['role'] ?? 'user',
    ]);
    return $user->id;
  }

  public function update(int $id, array $data): bool
  {
    $user = EloquentUser::find($id);
    if (!$user) {
      return false;
    }

    $updateData = [];
    foreach (['email', 'phone'] as $field) {
      if (isset($data[$field])) {
        $updateData[$field] = $data[$field];
      }
    }

    if (empty($updateData)) {
      return false;
    }

    return $user->update($updateData);
  }

  public function updateStatus(int $id, int $status): bool
  {
    $user = EloquentUser::find($id);
    if (!$user) {
      return false;
    }
    return $user->update(['status' => $status]);
  }

  public function getAll(int $page = 1, int $limit = 10, ?string $search = null): array
  {
    $query = EloquentUser::withCount([
      'publishedTasks as published_tasks',
      'acceptedTasks as accepted_tasks',
    ])
      ->select('users.*');

    if ($search) {
      $query->where(function ($q) use ($search) {
        $q->where('username', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%");
      });
    }

    $total = $query->count();
    $users = $query->orderBy('created_at', 'desc')
      ->skip(($page - 1) * $limit)
      ->take($limit)
      ->get()
      ->map(function ($user) {
        $array = $user->toArray();
        // 计算平均评分
        $avgRating = \App\Models\Eloquent\Review::where('reviewee_id', $user->id)
          ->avg('rating');
        $array['avg_rating'] = round((float) ($avgRating ?? 0), 1);
        return $array;
      })
      ->toArray();

    return [
      'data' => $users,
      'total' => $total,
      'page' => $page,
      'limit' => $limit,
      'pages' => ceil($total / $limit)
    ];
  }

  public function verifyPassword(array $user, string $password): bool
  {
    $eloquentUser = EloquentUser::find($user['id']);
    if (!$eloquentUser) {
      return false;
    }
    return password_verify($password, $eloquentUser->password_hash);
  }
}
