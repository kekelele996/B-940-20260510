FROM php:8.2-fpm

# 安装依赖
RUN apt-get update && apt-get install -y \
  nginx \
  libpng-dev \
  libjpeg-dev \
  libfreetype6-dev \
  zip \
  unzip \
  git \
  curl \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install gd pdo pdo_mysql \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 安装Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 配置Nginx
COPY nginx.conf /etc/nginx/sites-available/default

# 设置工作目录
WORKDIR /var/www/html

# 复制项目文件
COPY . .

# 安装PHP依赖
RUN composer install --no-dev --optimize-autoloader || true

# 设置权限
RUN chown -R www-data:www-data /var/www/html

# 启动 Nginx 和 PHP-FPM
CMD ["sh", "-c", "service nginx start && php-fpm"]
