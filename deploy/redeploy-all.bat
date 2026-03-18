@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"

if exist "%SCRIPT_DIR%set-env.bat" (
  call "%SCRIPT_DIR%set-env.bat"
)

if not defined NEXT_PUBLIC_FIREBASE_API_KEY (
  echo Missing required environment variables for web build.
  echo Create deploy\set-env.bat from deploy\set-env.example.bat and run again.
  exit /b 1
)

set "PROJECT_ID=%PROJECT_ID%"
if not defined PROJECT_ID set "PROJECT_ID=final-year-project-3e1a4"

set "REGION=%REGION%"
if not defined REGION set "REGION=europe-west1"

set "WEB_SERVICE=%WEB_SERVICE%"
if not defined WEB_SERVICE set "WEB_SERVICE=smartcorenting-web"

set "REALTIME_SERVICE=%REALTIME_SERVICE%"
if not defined REALTIME_SERVICE set "REALTIME_SERVICE=smartcorenting-realtime"

echo [1/4] Rebuilding and deploying realtime
call "%SCRIPT_DIR%redeploy-realtime.bat"
if errorlevel 1 exit /b 1

for /f "delims=" %%u in ('gcloud run services describe %REALTIME_SERVICE% --region %REGION% --format="value(status.url)"') do set "REALTIME_URL=%%u"
if not defined REALTIME_URL (
  echo Failed to determine REALTIME_URL
  exit /b 1
)
echo REALTIME_URL=%REALTIME_URL%

echo [2/4] Rebuilding and deploying web
call "%SCRIPT_DIR%redeploy-web.bat" "%REALTIME_URL%"
if errorlevel 1 exit /b 1

for /f "delims=" %%u in ('gcloud run services describe %WEB_SERVICE% --region %REGION% --format="value(status.url)"') do set "WEB_URL=%%u"
if not defined WEB_URL (
  echo Failed to determine WEB_URL
  exit /b 1
)
echo WEB_URL=%WEB_URL%

echo [3/4] Updating realtime CORS with web origin
call gcloud run services update %REALTIME_SERVICE% ^
  --region %REGION% ^
  --update-env-vars "CORS_ORIGINS=http://localhost:3000\,%WEB_URL%"
if errorlevel 1 exit /b 1

echo [4/4] Done
echo Realtime: %REALTIME_URL%
echo Web: %WEB_URL%
