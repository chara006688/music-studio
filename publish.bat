@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   Docker Hub Upload Script
echo ==========================================
echo.

:: Config
set IMAGE_NAME=music-studio
set VERSION=1.0.0

:: Get Docker Hub username
set /p DOCKER_USERNAME="Enter your Docker Hub username: "

if "%DOCKER_USERNAME%"=="" (
    echo ERROR: Username cannot be empty
    pause
    exit /b 1
)

:: Full image name
set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%

echo.
echo Image Info:
echo   Name: %FULL_IMAGE_NAME%
echo   Version: %VERSION%
echo   Tag: %FULL_IMAGE_NAME%:latest
echo.

set /p CONFIRM="Confirm? (y/N) "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

:: Step 1: Check Docker login
echo.
echo [Step 1/5] Checking Docker login...
docker info | findstr "Username" >nul 2>&1
if errorlevel 1 (
    echo Not logged in. Please enter your Docker Hub password:
    docker login -u %DOCKER_USERNAME%
    if errorlevel 1 (
        echo ERROR: Login failed
        pause
        exit /b 1
    )
) else (
    echo OK: Already logged in
)

:: Step 2: Build image
echo.
echo [Step 2/5] Building Docker image...
docker build -t %IMAGE_NAME% .
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo OK: Build successful

:: Step 3: Tag image
echo.
echo [Step 3/5] Tagging image...

docker tag %IMAGE_NAME% %FULL_IMAGE_NAME%:%VERSION%
echo OK: Created tag %VERSION%

docker tag %IMAGE_NAME% %FULL_IMAGE_NAME%:latest
echo OK: Created tag latest

:: Step 4: Push to Docker Hub
echo.
echo [Step 4/5] Pushing to Docker Hub...
echo This may take a few minutes...
echo.

echo Pushing version tag %VERSION%...
docker push %FULL_IMAGE_NAME%:%VERSION%
if errorlevel 1 (
    echo ERROR: Failed to push version tag
    pause
    exit /b 1
)

echo Pushing latest tag...
docker push %FULL_IMAGE_NAME%:latest
if errorlevel 1 (
    echo ERROR: Failed to push latest tag
    pause
    exit /b 1
)

:: Step 5: Verify
echo.
echo [Step 5/5] Verifying upload...
docker manifest inspect %FULL_IMAGE_NAME%:%VERSION% >nul 2>&1
if errorlevel 1 (
    echo WARN: Verification failed, please check manually
) else (
    echo OK: Image successfully uploaded
)

:: Success
echo.
echo ==========================================
echo   SUCCESS!
echo ==========================================
echo.
echo Image Info:
echo   Docker Hub: https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo   Pull: docker pull %FULL_IMAGE_NAME%:%VERSION%
echo   Run:  docker run -d -p 8080:80 %FULL_IMAGE_NAME%:%VERSION%
echo.
echo Image List:
docker images | findstr %FULL_IMAGE_NAME%
echo.
echo Tips:
echo   - Edit image description on Docker Hub
echo   - Setup automated builds (optional)
echo   - Update image regularly
echo.
pause
