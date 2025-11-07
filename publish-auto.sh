#!/bin/bash

# Docker Hub 自动版本上传脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "  Docker Hub Auto-Version Upload"
echo "=========================================="
echo ""

IMAGE_NAME="music-studio"
VERSION_FILE="version.txt"

# 读取当前版本
if [ -f "$VERSION_FILE" ]; then
    CURRENT_VERSION=$(cat $VERSION_FILE)
else
    CURRENT_VERSION="1.0.0"
    echo $CURRENT_VERSION > $VERSION_FILE
fi

echo -e "${BLUE}Current Version: $CURRENT_VERSION${NC}"
echo ""

# 解析版本号
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# 选择版本类型
echo "Select version increment:"
echo "  1 - Patch (bug fixes)       : $CURRENT_VERSION -> $MAJOR.$MINOR.$((PATCH+1))"
echo "  2 - Minor (new features)    : $CURRENT_VERSION -> $MAJOR.$((MINOR+1)).0"
echo "  3 - Major (breaking changes): $CURRENT_VERSION -> $((MAJOR+1)).0.0"
echo "  4 - Keep current version    : $CURRENT_VERSION"
echo "  5 - Custom version"
echo ""
read -p "Choose (1-5): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH+1))"
        VERSION_TYPE="Patch"
        ;;
    2)
        NEW_VERSION="$MAJOR.$((MINOR+1)).0"
        VERSION_TYPE="Minor"
        ;;
    3)
        NEW_VERSION="$((MAJOR+1)).0.0"
        VERSION_TYPE="Major"
        ;;
    4)
        NEW_VERSION="$CURRENT_VERSION"
        VERSION_TYPE="Current"
        ;;
    5)
        read -p "Enter custom version (e.g., 2.1.3): " NEW_VERSION
        VERSION_TYPE="Custom"
        ;;
    *)
        echo -e "${RED}ERROR: Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Version Update: $CURRENT_VERSION -> $NEW_VERSION [$VERSION_TYPE]${NC}"
echo ""

# 获取用户名
read -p "Enter Docker Hub username: " DOCKER_USERNAME

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}ERROR: Username cannot be empty${NC}"
    exit 1
fi

FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME"

echo ""
echo "=========================================="
echo "  Build and Push Summary"
echo "=========================================="
echo "  Image: $FULL_IMAGE_NAME"
echo "  Old Version: $CURRENT_VERSION"
echo "  New Version: $NEW_VERSION"
echo "  Tags: $NEW_VERSION, latest"
echo "=========================================="
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Step 1: Check Docker
echo ""
echo -e "${YELLOW}[Step 1/6] Checking Docker status...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

if ! docker info | grep -q "Username"; then
    echo "Please login to Docker Hub:"
    docker login -u "$DOCKER_USERNAME"
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Login failed${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}OK: Docker is ready${NC}"

# Step 2: Build
echo ""
echo -e "${YELLOW}[Step 2/6] Building image...${NC}"
docker build -t $IMAGE_NAME .
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}OK: Build successful${NC}"

# Step 3: Tag
echo ""
echo -e "${YELLOW}[Step 3/6] Tagging image...${NC}"
docker tag $IMAGE_NAME $FULL_IMAGE_NAME:$NEW_VERSION
echo -e "${GREEN}OK: Tagged $NEW_VERSION${NC}"

docker tag $IMAGE_NAME $FULL_IMAGE_NAME:latest
echo -e "${GREEN}OK: Tagged latest${NC}"

# Step 4: Push
echo ""
echo -e "${YELLOW}[Step 4/6] Pushing to Docker Hub...${NC}"
echo "This may take several minutes..."
echo ""

docker push $FULL_IMAGE_NAME:$NEW_VERSION
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to push version tag${NC}"
    exit 1
fi

docker push $FULL_IMAGE_NAME:latest
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to push latest tag${NC}"
    exit 1
fi

# Step 5: Save version
echo ""
echo -e "${YELLOW}[Step 5/6] Updating version file...${NC}"
echo $NEW_VERSION > $VERSION_FILE
echo -e "${GREEN}OK: Version updated to $NEW_VERSION${NC}"

# Step 6: Verify
echo ""
echo -e "${YELLOW}[Step 6/6] Verifying...${NC}"
docker images | grep $FULL_IMAGE_NAME

echo ""
echo -e "${GREEN}=========================================="
echo "  UPLOAD SUCCESSFUL!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Docker Hub: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME${NC}"
echo ""
echo "Usage:"
echo "  docker pull $FULL_IMAGE_NAME:$NEW_VERSION"
echo "  docker run -d -p 8080:80 $FULL_IMAGE_NAME:$NEW_VERSION"
echo ""
echo "Version saved to: $VERSION_FILE"
echo "Next upload will increment from: $NEW_VERSION"
echo ""
