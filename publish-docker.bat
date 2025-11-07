@echo off
chcp 65001 >nul
:: Docker Hub 发布脚本 (Windows)

setlocal enabledelayedexpansion

echo ==========================================
echo   ?? Docker Hub 镜像发布脚本
echo ==========================================
echo.

:: 配置
set IMAGE_NAME=music-studio
set VERSION=1.0.0

:: 获取Docker Hub用户名
set /p DOCKER_USERNAME="请输入你的 Docker Hub 用户名: "

if "%DOCKER_USERNAME%"=="" (
    echo ? 用户名不能为空
    pause
    exit /b 1
)

:: 完整镜像名称
set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%

echo.
echo ?? 镜像信息:
echo   镜像名称: %FULL_IMAGE_NAME%
echo   版本标签: %VERSION%
echo   latest 标签: %FULL_IMAGE_NAME%:latest
echo.

:: 确认信息
set /p CONFIRM="确认以上信息正确？(y/N) "
if /i not "%CONFIRM%"=="y" (
    echo ??  已取消
    pause
    exit /b 0
)

:: 步骤1: 检查Docker登录状态
echo.
echo ?? 步骤 1/5: 检查 Docker 登录状态...
docker info | findstr "Username" >nul 2>&1
if errorlevel 1 (
    echo ??  未登录，请输入 Docker Hub 密码
    docker login -u %DOCKER_USERNAME%
    if errorlevel 1 (
        echo ? 登录失败
        pause
        exit /b 1
    )
) else (
    echo ? 已登录 Docker Hub
)

:: 步骤2: 构建镜像
echo.
echo ?? 步骤 2/5: 构建 Docker 镜像...
docker build -t %IMAGE_NAME% .
if errorlevel 1 (
    echo ? 构建失败
    pause
    exit /b 1
)
echo ? 构建成功

:: 步骤3: 打标签
echo.
echo ???  步骤 3/5: 打标签...

:: 打版本标签
docker tag %IMAGE_NAME% %FULL_IMAGE_NAME%:%VERSION%
echo ? 已创建标签: %FULL_IMAGE_NAME%:%VERSION%

:: 打latest标签
docker tag %IMAGE_NAME% %FULL_IMAGE_NAME%:latest
echo ? 已创建标签: %FULL_IMAGE_NAME%:latest

:: 步骤4: 推送到Docker Hub
echo.
echo ?? 步骤 4/5: 推送到 Docker Hub...
echo 这可能需要几分钟，请耐心等待...
echo.

:: 推送版本标签
echo 推送版本标签 %VERSION%...
docker push %FULL_IMAGE_NAME%:%VERSION%
if errorlevel 1 (
    echo ? 推送版本标签失败
    pause
    exit /b 1
)

:: 推送latest标签
echo 推送 latest 标签...
docker push %FULL_IMAGE_NAME%:latest
if errorlevel 1 (
    echo ? 推送 latest 标签失败
    pause
    exit /b 1
)

:: 步骤5: 验证
echo.
echo ??  步骤 5/5: 验证上传...
docker manifest inspect %FULL_IMAGE_NAME%:%VERSION% >nul 2>&1
if errorlevel 1 (
    echo ??  验证失败，请手动检查
) else (
    echo ? 镜像已成功上传到 Docker Hub
)

:: 完成
echo.
echo ==========================================
echo   ?? 发布成功！
echo ==========================================
echo.
echo ?? 镜像信息:
echo   Docker Hub: https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo   拉取命令: docker pull %FULL_IMAGE_NAME%:%VERSION%
echo   运行命令: docker run -d -p 8080:80 %FULL_IMAGE_NAME%:%VERSION%
echo.
echo ?? 镜像统计:
docker images | findstr %FULL_IMAGE_NAME%
echo.
echo ?? 提示:
echo   - 在 Docker Hub 上编辑镜像描述和文档
echo   - 设置自动构建（可选）
echo   - 定期更新镜像版本
echo.
pause
