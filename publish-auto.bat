@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   Docker Hub Auto-Version Upload
echo ==========================================
echo.

:: Config
set IMAGE_NAME=music-studio
set VERSION_FILE=version.txt

:: Read current version
if exist %VERSION_FILE% (
    set /p CURRENT_VERSION=<%VERSION_FILE%
) else (
    set CURRENT_VERSION=1.0.0
    echo !CURRENT_VERSION! > %VERSION_FILE%
)

echo Current Version: %CURRENT_VERSION%
echo.

:: Parse version (major.minor.patch)
for /f "tokens=1,2,3 delims=." %%a in ("%CURRENT_VERSION%") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

:: Ask which version to increment
echo Select version increment:
echo   1 - Patch (bug fixes)      : %MAJOR%.%MINOR%.!PATCH! -^> %MAJOR%.%MINOR%.!PATCH!+1
echo   2 - Minor (new features)   : %MAJOR%.%MINOR%.!PATCH! -^> %MAJOR%.!MINOR!+1.0
echo   3 - Major (breaking changes): %MAJOR%.%MINOR%.!PATCH! -^> !MAJOR!+1.0.0
echo   4 - Keep current version    : %MAJOR%.%MINOR%.!PATCH!
echo   5 - Custom version
echo.
set /p VERSION_CHOICE="Choose (1-5): "

if "%VERSION_CHOICE%"=="1" (
    set /a PATCH+=1
    set NEW_VERSION=!MAJOR!.!MINOR!.!PATCH!
    set VERSION_TYPE=Patch
) else if "%VERSION_CHOICE%"=="2" (
    set /a MINOR+=1
    set PATCH=0
    set NEW_VERSION=!MAJOR!.!MINOR!.!PATCH!
    set VERSION_TYPE=Minor
) else if "%VERSION_CHOICE%"=="3" (
    set /a MAJOR+=1
    set MINOR=0
    set PATCH=0
    set NEW_VERSION=!MAJOR!.!MINOR!.!PATCH!
    set VERSION_TYPE=Major
) else if "%VERSION_CHOICE%"=="4" (
    set NEW_VERSION=%CURRENT_VERSION%
    set VERSION_TYPE=Current
) else if "%VERSION_CHOICE%"=="5" (
    set /p NEW_VERSION="Enter custom version (e.g., 2.1.3): "
    set VERSION_TYPE=Custom
) else (
    echo ERROR: Invalid choice
    pause
    exit /b 1
)

echo.
echo Version Update: %CURRENT_VERSION% -^> %NEW_VERSION% [%VERSION_TYPE%]
echo.

:: Get Docker Hub username
set /p DOCKER_USERNAME="Enter Docker Hub username: "
if "%DOCKER_USERNAME%"=="" (
    echo ERROR: Username cannot be empty
    pause
    exit /b 1
)

set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%

echo.
echo ==========================================
echo   Build and Push Summary
echo ==========================================
echo   Image: %FULL_IMAGE_NAME%
echo   Old Version: %CURRENT_VERSION%
echo   New Version: %NEW_VERSION%
echo   Tags: %NEW_VERSION%, latest
echo ==========================================
echo.

set /p CONFIRM="Continue? (y/N) "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)

:: Check Docker login
echo.
echo [Step 1/6] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

docker info | findstr "Username" >nul 2>&1
if errorlevel 1 (
    echo Please login to Docker Hub:
    docker login -u %DOCKER_USERNAME%
    if errorlevel 1 (
        echo ERROR: Login failed
        pause
        exit /b 1
    )
)
echo OK: Docker is ready

:: Build
echo.
echo [Step 2/6] Building image...
docker build -t %IMAGE_NAME% .
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo OK: Build successful

:: Tag
echo.
echo [Step 3/6] Tagging image...
docker tag %IMAGE_NAME% %FULL_IMAGE_NAME%:%NEW_VERSION%
echo OK: Tagged %NEW_VERSION%

docker tag %IMAGE_NAME% %FULL_IMAGE_NAME%:latest
echo OK: Tagged latest

:: Push
echo.
echo [Step 4/6] Pushing to Docker Hub...
echo This may take several minutes...
echo.

docker push %FULL_IMAGE_NAME%:%NEW_VERSION%
if errorlevel 1 (
    echo ERROR: Failed to push version tag
    pause
    exit /b 1
)

docker push %FULL_IMAGE_NAME%:latest
if errorlevel 1 (
    echo ERROR: Failed to push latest tag
    pause
    exit /b 1
)

:: Save new version
echo.
echo [Step 5/6] Updating version file...
echo %NEW_VERSION% > %VERSION_FILE%
echo OK: Version updated to %NEW_VERSION%

:: Verify
echo.
echo [Step 6/6] Verifying...
docker images | findstr %FULL_IMAGE_NAME%

echo.
echo ==========================================
echo   UPLOAD SUCCESSFUL!
echo ==========================================
echo.
echo Docker Hub: https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo.
echo Usage:
echo   docker pull %FULL_IMAGE_NAME%:%NEW_VERSION%
echo   docker run -d -p 8080:80 %FULL_IMAGE_NAME%:%NEW_VERSION%
echo.
echo Version saved to: %VERSION_FILE%
echo Next upload will be: %NEW_VERSION% -^> ?
echo.
pause
