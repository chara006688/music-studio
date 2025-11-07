# 🐳 Docker Hub 完整上传指南

## 📋 目录
- [前期准备](#前期准备)
- [快速上传](#快速上传)
- [手动步骤](#手动步骤)
- [镜像管理](#镜像管理)
- [常见问题](#常见问题)

---

## 🎯 前期准备

### 1. 注册 Docker Hub 账号

访问：https://hub.docker.com/signup

1. 输入用户名（重要！后面会用到）
2. 输入邮箱
3. 设置密码
4. 验证邮箱

**注意**：用户名将是你的命名空间，例如：`yourusername/music-studio`

### 2. 安装 Docker Desktop

- **Windows**: https://www.docker.com/products/docker-desktop
- **Mac**: https://www.docker.com/products/docker-desktop
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

### 3. 验证安装

```bash
docker --version
docker info
```

---

## 🚀 快速上传

### 使用自动化脚本（推荐）

#### Windows
```bash
# 双击运行
publish-docker.bat

# 或在命令行
cd C:\Users\23735\Desktop\autogame\something\1\music-studio
publish-docker.bat
```

#### Linux/Mac
```bash
chmod +x publish-docker.sh
./publish-docker.sh
```

脚本会自动完成：
- ✅ 检查登录状态
- ✅ 构建镜像
- ✅ 打标签
- ✅ 推送到 Docker Hub
- ✅ 验证上传

---

## 🔧 手动步骤详解

### 步骤 1: 登录 Docker Hub

```bash
docker login
# 输入用户名
# 输入密码（或访问令牌）
```

**使用访问令牌（推荐）**：
1. 访问 https://hub.docker.com/settings/security
2. 点击 "New Access Token"
3. 输入描述（如：music-studio-deploy）
4. 选择权限（Read, Write, Delete）
5. 复制令牌（只显示一次！）
6. 使用令牌作为密码登录

### 步骤 2: 构建镜像

```bash
# 进入项目目录
cd C:\Users\23735\Desktop\autogame\something\1\music-studio

# 构建镜像
docker build -t music-studio .

# 查看构建结果
docker images | grep music-studio
```

### 步骤 3: 打标签

```bash
# 替换 yourusername 为你的 Docker Hub 用户名
# 版本标签
docker tag music-studio yourusername/music-studio:1.0.0

# latest 标签
docker tag music-studio yourusername/music-studio:latest

# 查看标签
docker images | grep yourusername/music-studio
```

### 步骤 4: 推送镜像

```bash
# 推送版本标签
docker push yourusername/music-studio:1.0.0

# 推送 latest 标签
docker push yourusername/music-studio:latest
```

**推送过程示例**：
```
The push refers to repository [docker.io/yourusername/music-studio]
5f70bf18a086: Pushed
e16c0c8a1d3a: Pushed
...
1.0.0: digest: sha256:abc123... size: 1234
```

### 步骤 5: 验证上传

访问你的仓库页面：
```
https://hub.docker.com/r/yourusername/music-studio
```

或命令行验证：
```bash
docker manifest inspect yourusername/music-studio:1.0.0
```

---

## 📦 镜像版本管理

### 语义化版本控制

推荐使用语义化版本（SemVer）：

```bash
# 主版本.次版本.修订版本
docker tag music-studio yourusername/music-studio:1.0.0  # 初始版本
docker tag music-studio yourusername/music-studio:1.0.1  # 修复bug
docker tag music-studio yourusername/music-studio:1.1.0  # 新功能
docker tag music-studio yourusername/music-studio:2.0.0  # 重大变更
```

### 推送多个标签

```bash
# 一次性打多个标签
docker tag music-studio yourusername/music-studio:1.0.0
docker tag music-studio yourusername/music-studio:1.0
docker tag music-studio yourusername/music-studio:1
docker tag music-studio yourusername/music-studio:latest

# 批量推送
docker push yourusername/music-studio:1.0.0
docker push yourusername/music-studio:1.0
docker push yourusername/music-studio:1
docker push yourusername/music-studio:latest
```

### 推送所有标签

```bash
docker push yourusername/music-studio --all-tags
```

---

## 🎨 在 Docker Hub 上完善镜像

### 1. 添加 README 文档

在项目中创建 `README.md`，内容示例：

```markdown
# 🎵 音乐工作站 - Music Studio

一个集成虚拟鼓组和蒸汽波可视化器的音乐创作平台。

## 快速开始

docker run -d -p 8080:80 yourusername/music-studio:latest

访问 http://localhost:8080

## 功能特性

- 🥁 虚拟鼓组 - 8个鼓垫，键盘演奏
- 🎵 可视化器 - 6种可视化模式
- 📁 文件支持 - 上传本地音频
- ⏯️ 播放控制 - 进度条和播放控制
- 🎨 实时参数 - 实时调节特效参数

## 使用指南

详见：https://github.com/yourusername/music-studio
```

Docker Hub 会自动使用这个 README。

### 2. 设置仓库描述

在 Docker Hub 网页上：
1. 进入你的仓库
2. 点击 "Settings"
3. 编辑 "Short Description"（简短描述）
4. 编辑 "Full Description"（完整描述）

### 3. 添加标签（Tags）

便于搜索和分类：
- `music`
- `audio`
- `visualizer`
- `drum-machine`
- `web-app`
- `vaporwave`

---

## 📥 别人如何使用你的镜像

### 拉取镜像

```bash
docker pull yourusername/music-studio:latest
```

### 运行容器

```bash
# 基本运行
docker run -d -p 8080:80 yourusername/music-studio:latest

# 自定义端口
docker run -d -p 3000:80 yourusername/music-studio:latest

# 指定名称和自动重启
docker run -d \
  --name my-music-studio \
  -p 8080:80 \
  --restart unless-stopped \
  yourusername/music-studio:latest
```

### 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  music-studio:
    image: yourusername/music-studio:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

---

## 🔄 更新镜像

### 发布新版本

```bash
# 1. 修改代码
# 2. 更新版本号
VERSION=1.1.0

# 3. 重新构建
docker build -t music-studio .

# 4. 打新标签
docker tag music-studio yourusername/music-studio:$VERSION
docker tag music-studio yourusername/music-studio:latest

# 5. 推送新版本
docker push yourusername/music-studio:$VERSION
docker push yourusername/music-studio:latest
```

### 用户更新镜像

```bash
# 拉取最新版本
docker pull yourusername/music-studio:latest

# 停止旧容器
docker stop music-studio

# 删除旧容器
docker rm music-studio

# 运行新版本
docker run -d -p 8080:80 --name music-studio yourusername/music-studio:latest
```

---

## 📊 镜像统计和监控

### 查看下载量

访问：`https://hub.docker.com/r/yourusername/music-studio`

可以看到：
- 总下载次数
- 星标数量
- 最后更新时间

### 查看镜像详情

```bash
# 查看镜像信息
docker inspect yourusername/music-studio:latest

# 查看镜像历史
docker history yourusername/music-studio:latest

# 查看镜像大小
docker images yourusername/music-studio
```

---

## 🛡️ 安全最佳实践

### 1. 使用访问令牌而非密码

在 CI/CD 中使用令牌：
```bash
echo $DOCKER_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin
```

### 2. 扫描漏洞

```bash
# Docker Hub 自动扫描（需要订阅）
# 或使用本地扫描
docker scan yourusername/music-studio:latest
```

### 3. 签名镜像

```bash
# 启用 Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# 推送将自动签名
docker push yourusername/music-studio:latest
```

### 4. 最小化镜像

- 使用 Alpine 基础镜像
- 多阶段构建
- 删除不必要的文件

---

## 🤝 协作和团队管理

### 创建组织

1. 访问 https://hub.docker.com/orgs
2. 创建新组织
3. 添加团队成员
4. 设置权限

### 组织镜像

```bash
docker tag music-studio yourorg/music-studio:latest
docker push yourorg/music-studio:latest
```

---

## ❓ 常见问题

### Q: 推送失败 "denied: requested access to the resource is denied"

**A**: 检查：
1. 是否已登录：`docker login`
2. 用户名是否正确
3. 镜像标签是否包含你的用户名

### Q: 推送很慢

**A**: 
- 检查网络连接
- 使用国内镜像加速器
- 优化镜像大小

### Q: 如何删除 Docker Hub 上的镜像

**A**: 
1. 访问仓库页面
2. 进入 "Tags" 标签
3. 选择要删除的标签
4. 点击删除按钮

或使用 API：
```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://hub.docker.com/v2/repositories/yourusername/music-studio/tags/1.0.0/
```

### Q: 镜像大小太大

**A**: 优化建议：
```dockerfile
# 使用更小的基础镜像
FROM node:18-alpine

# 多阶段构建
FROM nginx:alpine

# 清理缓存
RUN npm ci --only=production && \
    npm cache clean --force
```

### Q: 如何设置私有仓库

**A**: 
1. 进入仓库设置
2. 选择 "Make Private"
3. 确认（可能需要付费订阅）

---

## 📚 参考资源

- [Docker Hub 官方文档](https://docs.docker.com/docker-hub/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker CLI 参考](https://docs.docker.com/engine/reference/commandline/cli/)

---

## 🎉 完整示例

```bash
# 1. 登录
docker login

# 2. 构建
docker build -t music-studio .

# 3. 标签
docker tag music-studio yourusername/music-studio:1.0.0
docker tag music-studio yourusername/music-studio:latest

# 4. 推送
docker push yourusername/music-studio:1.0.0
docker push yourusername/music-studio:latest

# 5. 验证
docker pull yourusername/music-studio:latest
docker run -d -p 8080:80 yourusername/music-studio:latest

# 访问 http://localhost:8080
```

成功！🎊
