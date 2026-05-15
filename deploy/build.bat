@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0..
set JAR_NAME=ironsync-3d.jar

echo === IronSync-3D Build Script ===
echo Project dir: %PROJECT_DIR%
echo.

cd /d "%PROJECT_DIR%"

REM Try project Maven wrapper first
if exist "mvnw.cmd" (
    set MVN_CMD=.\mvnw.cmd
    echo Using project Maven wrapper: !MVN_CMD!
) else (
    where mvn >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        set MVN_CMD=mvn
        echo mvnw.cmd not found, falling back to system Maven
    ) else (
        echo ERROR: No Maven found ^(mvnw.cmd missing and mvn not in PATH^)
        exit /b 1
    )
)

echo.
echo Step 1: Maven clean package
call !MVN_CMD! clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    exit /b %ERRORLEVEL%
)
echo.

echo Step 2: Verify artifact
if not exist "target\%JAR_NAME%" (
    echo ERROR: target\%JAR_NAME% not found!
    exit /b 1
)

echo Step 3: Copy artifact to deploy/
copy /Y "target\%JAR_NAME%" "deploy\%JAR_NAME%"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Copy failed
    exit /b 1
)

echo.
echo === Build Complete ===
echo Artifact: deploy\ironsync-3d.jar
