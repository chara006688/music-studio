#!/bin/bash

# Docker Hub 发布脚本

set -e

echo "=========================================="
echo "  🐳 Docker Hub 镜像发布脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
IMAGE_NAME="music-studio"
VERSION="1.0.0"

# 获取Docker Hub用户名
read -p "请输入你的 Docker Hub 用户名: " DOCKER_USERNAME

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}❌ 用户名不能为空${NC}"
    exit 1
fi

# 完整镜像名称
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME"

echo ""
echo -e "${BLUE}📋 镜像信息:${NC}"
echo "  镜像名称: $FULL_IMAGE_NAME"
echo "  版本标签: $VERSION"
echo "  latest 标签: $FULL_IMAGE_NAME:latest"
echo ""

# 确认信息
read -p "确认以上信息正确？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  已取消${NC}"
    exit 0
fi

# 步骤1: 检查Docker登录状态
echo ""
echo -e "${YELLOW}📝 步骤 1/5: 检查 Docker 登录状态...${NC}"
if docker info | grep -q "Username"; then
    echo -e "${GREEN}✅ 已登录 Docker Hub${NC}"
else
    echo -e "${YELLOW}⚠️  未登录，请输入 Docker Hub 密码${NC}"
    docker login -u "$DOCKER_USERNAME"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 登录失败${NC}"
        exit 1
    fi
fi

# 步骤2: 构建镜像
echo ""
echo -e "${YELLOW}🔨 步骤 2/5: 构建 Docker 镜像...${NC}"
docker build -t $IMAGE_NAME .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 构建成功${NC}"

# 步骤3: 打标签
echo ""
echo -e "${YELLOW}🏷️  步骤 3/5: 打标签...${NC}"

# 打版本标签
docker tag $IMAGE_NAME $FULL_IMAGE_NAME:$VERSION
echo -e "${GREEN}✅ 已创建标签: $FULL_IMAGE_NAME:$VERSION${NC}"

# 打latest标签
docker tag $IMAGE_NAME $FULL_IMAGE_NAME:latest
echo -e "${GREEN}✅ 已创建标签: $FULL_IMAGE_NAME:latest${NC}"

# 步骤4: 推送到Docker Hub
echo ""
echo -e "${YELLOW}📤 步骤 4/5: 推送到 Docker Hub...${NC}"
echo "这可能需要几分钟，请耐心等待..."
echo ""

# 推送版本标签
echo -e "${BLUE}推送版本标签 $VERSION...${NC}"
docker push $FULL_IMAGE_NAME:$VERSION
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 推送版本标签失败${NC}"
    exit 1
fi

# 推送latest标签
echo -e "${BLUE}推送 latest 标签...${NC}"
docker push $FULL_IMAGE_NAME:latest
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 推送 latest 标签失败${NC}"
    exit 1
fi

# 步骤5: 验证
echo ""
echo -e "${YELLOW}✔️  步骤 5/5: 验证上传...${NC}"
if docker manifest inspect $FULL_IMAGE_NAME:$VERSION > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 镜像已成功上传到 Docker Hub${NC}"
else
    echo -e "${RED}❌ 验证失败，请手动检查${NC}"
fi

# 完成
echo ""
echo -e "${GREEN}=========================================="
echo "  🎉 发布成功！"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}📦 镜像信息:${NC}"
echo "  Docker Hub: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
echo "  拉取命令: docker pull $FULL_IMAGE_NAME:$VERSION"
echo "  运行命令: docker run -d -p 8080:80 $FULL_IMAGE_NAME:$VERSION"
echo ""
echo -e "${BLUE}📊 镜像统计:${NC}"
docker images | grep $FULL_IMAGE_NAME
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "  - 在 Docker Hub 上编辑镜像描述和文档"
echo "  - 设置自动构建（可选）"
echo "  - 定期更新镜像版本"
echo ""
