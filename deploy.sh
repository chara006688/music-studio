#!/bin/bash

# 音乐工作站 Docker 部署脚本

set -e

echo "=========================================="
echo "  🎵 音乐工作站 Docker 部署脚本"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置
IMAGE_NAME="music-studio"
CONTAINER_NAME="music-studio"
PORT=8080

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 停止并删除旧容器
echo -e "${YELLOW}🔄 停止旧容器...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 删除旧镜像（可选）
read -p "是否删除旧镜像？(y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  删除旧镜像...${NC}"
    docker rmi $IMAGE_NAME 2>/dev/null || true
fi

# 构建新镜像
echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
docker build -t $IMAGE_NAME .

# 运行容器
echo -e "${YELLOW}🚀 启动容器...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --restart unless-stopped \
    $IMAGE_NAME

# 检查容器状态
sleep 2
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
    echo -e "${GREEN}🌐 访问地址: http://localhost:$PORT${NC}"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker logs -f $CONTAINER_NAME"
    echo "  停止容器: docker stop $CONTAINER_NAME"
    echo "  启动容器: docker start $CONTAINER_NAME"
    echo "  删除容器: docker rm -f $CONTAINER_NAME"
else
    echo -e "${RED}❌ 部署失败，请查看日志${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi
