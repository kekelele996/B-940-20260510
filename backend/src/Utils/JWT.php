<?php

namespace App\Utils;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;
use Exception;

class JWT
{
  private static string $secretKey = '';
  private static string $algorithm = 'HS256';

  public static function init(): void
  {
    self::$secretKey = getenv('JWT_SECRET') ?: 'tasksystem_jwt_secret_key_2026';
  }

  public static function encode(array $payload): string
  {
    self::init();
    $payload['iat'] = time();
    $payload['exp'] = time() + (60 * 60 * 24 * 7); // 7 days
    return FirebaseJWT::encode($payload, self::$secretKey, self::$algorithm);
  }

  public static function decode(string $token): ?array
  {
    self::init();
    try {
      $decoded = FirebaseJWT::decode($token, new Key(self::$secretKey, self::$algorithm));
      return (array) $decoded;
    } catch (Exception $e) {
      return null;
    }
  }
}
