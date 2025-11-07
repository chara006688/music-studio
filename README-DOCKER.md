# 🎵 音乐工作站 - Docker 部署指南

## 📋 前置要求

- [Docker](https://www.docker.com/get-started) 已安装
- [Docker Compose](https://docs.docker.com/compose/install/) (可选)

## 🚀 快速部署

### 方法1：使用部署脚本（推荐）

#### Windows
```bash
deploy.bat
```

#### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法2：使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方法3：手动 Docker 命令

```bash
# 1. 构建镜像
docker build -t music-studio .

# 2. 运行容器
docker run -d \
  --name music-studio \
  -p 8080:80 \
  --restart unless-stopped \
  music-studio

# 3. 访问应用
# http://localhost:8080
```

## 🔧 配置说明

### 端口配置
默认映射到 `8080` 端口，可以修改：
```bash
docker run -d -p 3000:80 music-studio  # 使用3000端口
```

### 环境变量
在 `docker-compose.yml` 中添加：
```yaml
environment:
  - NODE_ENV=production
  - VITE_API_URL=https://your-api.com
```

## 📦 镜像信息

- **基础镜像**: node:18-alpine (构建) + nginx:alpine (运行)
- **镜像大小**: 约 50MB
- **端口**: 80 (容器内部)
- **工作目录**: /usr/share/nginx/html

## 🎯 功能特性

✅ 多阶段构建，优化镜像大小  
✅ Nginx 提供静态文件服务  
✅ 支持 SPA 路由  
✅ Gzip 压缩  
✅ 静态资源缓存  
✅ 自动重启  
✅ 支持大文件上传（100MB）

## 📝 常用命令

```bash
# 查看运行中的容器
docker ps

# 查看日志
docker logs -f music-studio

# 进入容器
docker exec -it music-studio sh

# 停止容器
docker stop music-studio

# 启动容器
docker start music-studio

# 重启容器
docker restart music-studio

# 删除容器
docker rm -f music-studio

# 删除镜像
docker rmi music-studio

# 查看容器资源使用
docker stats music-studio
```

## 🌐 生产环境部署

### 1. 使用域名和 HTTPS

配合 Nginx 反向代理：

```nginx
server {
    listen 443 ssl http2;
    server_name music.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 推送到 Docker Hub

```bash
# 登录
docker login

# 打标签
docker tag music-studio yourusername/music-studio:latest

# 推送
docker push yourusername/music-studio:latest

# 在其他机器拉取并运行
docker pull yourusername/music-studio:latest
docker run -d -p 8080:80 yourusername/music-studio:latest
```

### 3. 使用 Docker Swarm 集群部署

```bash
# 初始化 Swarm
docker swarm init

# 部署服务
docker stack deploy -c docker-compose.yml music-studio

# 扩展服务
docker service scale music-studio_music-studio=3
```

## 🐛 故障排查

### 容器无法启动
```bash
# 查看详细日志
docker logs music-studio

# 检查端口占用
netstat -ano | findstr :8080  # Windows
lsof -i :8080                  # Linux/Mac
```

### 构建失败
```bash
# 清理缓存重新构建
docker build --no-cache -t music-studio .
```

### 内存不足
```bash
# 限制容器内存
docker run -d -m 512m --name music-studio -p 8080:80 music-studio
```

## 📊 性能优化

### 1. 启用 HTTP/2
修改 `nginx.conf`:
```nginx
listen 443 ssl http2;
```

### 2. 增加工作进程
修改 `nginx.conf`:
```nginx
worker_processes auto;
```

### 3. 缓存优化
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔐 安全建议

1. **更新基础镜像**
   ```bash
   docker pull node:18-alpine
   docker pull nginx:alpine
   ```

2. **使用非 root 用户**（在 Dockerfile 中添加）
   ```dockerfile
   RUN addgroup -S appgroup && adduser -S appuser -G appgroup
   USER appuser
   ```

3. **扫描漏洞**
   ```bash
   docker scan music-studio
   ```

## 📞 技术支持

如果遇到问题，请检查：
- Docker 版本是否最新
- 端口是否被占用
- 防火墙设置
- 磁盘空间是否充足

## 📄 许可证

MIT License
