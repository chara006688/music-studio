@echo off
chcp 65001 >nul
:: 音乐工作站 Docker 部署脚本 (Windows)

echo ==========================================
echo   🎵 音乐工作站 Docker 部署脚本
echo ==========================================
echo.

:: 配置
set IMAGE_NAME=music-studio
set CONTAINER_NAME=music-studio
set PORT=8080

:: 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

:: 停止并删除旧容器
echo 🔄 停止旧容器...
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

:: 询问是否删除旧镜像
set /p DELETE_IMAGE="是否删除旧镜像？(y/N) "
if /i "%DELETE_IMAGE%"=="y" (
    echo 🗑️  删除旧镜像...
    docker rmi %IMAGE_NAME% >nul 2>&1
)

:: 构建新镜像
echo 🔨 构建 Docker 镜像...
docker build -t %IMAGE_NAME% .
if errorlevel 1 (
    echo ❌ 镜像构建失败
    pause
    exit /b 1
)

:: 运行容器
echo 🚀 启动容器...
docker run -d --name %CONTAINER_NAME% -p %PORT%:80 --restart unless-stopped %IMAGE_NAME%
if errorlevel 1 (
    echo ❌ 容器启动失败
    pause
    exit /b 1
)

:: 等待容器启动
timeout /t 2 /nobreak >nul

:: 检查容器状态
docker ps | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo ❌ 部署失败，查看日志：
    docker logs %CONTAINER_NAME%
    pause
    exit /b 1
) else (
    echo ✅ 部署成功！
    echo 🌐 访问地址: http://localhost:%PORT%
    echo.
    echo 常用命令:
    echo   查看日志: docker logs -f %CONTAINER_NAME%
    echo   停止容器: docker stop %CONTAINER_NAME%
    echo   启动容器: docker start %CONTAINER_NAME%
    echo   删除容器: docker rm -f %CONTAINER_NAME%
    echo.
    pause
)
