<?php

namespace App\Config;

use Illuminate\Database\Capsule\Manager as Capsule;

class Eloquent
{
    private static bool $initialized = false;

    public static function initialize(): void
    {
        if (self::$initialized) {
            return;
        }

        $capsule = new Capsule;

        $capsule->addConnection([
            'driver' => 'mysql',
            'host' => getenv('DB_HOST') ?: 'db',
            'database' => getenv('DB_NAME') ?: 'tasksystem',
            'username' => getenv('DB_USER') ?: 'taskuser',
            'password' => getenv('DB_PASSWORD') ?: 'taskpassword',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
        ]);

        // 设置全局访问
        $capsule->setAsGlobal();
        
        // 启动 Eloquent ORM
        $capsule->bootEloquent();

        self::$initialized = true;
    }
}
