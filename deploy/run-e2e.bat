@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0..
set REPORTS_DIR=%PROJECT_DIR%\deploy\test-reports
set LATEST_DIR=%REPORTS_DIR%\latest

echo === IronSync-3D E2E Test Runner ===
echo Project dir: %PROJECT_DIR%
echo.

REM Step 1: Ensure output directory exists
echo Step 1: Ensure report directory exists
if not exist "%LATEST_DIR%" mkdir "%LATEST_DIR%"
echo   Report dir: %LATEST_DIR%
echo.

REM Step 2: Install dependencies
echo Step 2: Install Playwright dependencies
cd /d "%PROJECT_DIR%\test\e2e"

if not exist "package.json" (
    echo ERROR: package.json not found in test\e2e
    exit /b 1
)

echo   Running npm install...
call npm install --silent
if !ERRORLEVEL! neq 0 (
    echo   npm install had warnings, continuing...
)

echo   Installing Playwright browsers...
call npx playwright install chromium
echo.

REM Step 3: Run tests
echo Step 3: Run Playwright tests
call npx playwright test --reporter=html
set EXIT_CODE=!ERRORLEVEL!
echo   Playwright exit code: !EXIT_CODE!
echo.

REM Step 4: Copy report to deploy/test-reports/latest
echo Step 4: Copy report artifacts
if exist "playwright-report" (
    if exist "%LATEST_DIR%" (
        del /F /Q "%LATEST_DIR%\*" 2>nul
    )
    xcopy /E /I /Y "playwright-report\*" "%LATEST_DIR%\" >nul
    echo   Copied files to %LATEST_DIR%
) else (
    echo   WARNING: playwright-report directory not found.
)
echo.

REM Step 5: Generate report-meta.json
echo Step 5: Generate report metadata

REM Get UTC timestamp in ISO format using PowerShell
for /f %%i in ('powershell -Command "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'"') do set REPORT_TIMESTAMP=%%i

set TOTAL=0
set PASSED=0
set FAILED=0

REM If no tests ran but exit code is non-zero, count as 1 failure
if !EXIT_CODE! neq 0 (
    if !TOTAL! equ 0 (
        set FAILED=1
    )
)

> "%LATEST_DIR%\report-meta.json" (
    echo {
    echo   "timestamp": "!REPORT_TIMESTAMP!",
    echo   "total": !TOTAL!,
    echo   "passed": !PASSED!,
    echo   "failed": !FAILED!
    echo }
)

echo   report-meta.json written
echo   Timestamp: !REPORT_TIMESTAMP!
echo   Total: !TOTAL!, Passed: !PASSED!, Failed: !FAILED!
echo.

echo === E2E Test Run Complete ===
echo Report: %LATEST_DIR%\index.html
echo Meta:   %LATEST_DIR%\report-meta.json
exit /b !EXIT_CODE!
