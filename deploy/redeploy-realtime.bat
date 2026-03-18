@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "ROOT_DIR=%%~fI"

set "PROJECT_ID=%PROJECT_ID%"
if not defined PROJECT_ID set "PROJECT_ID=final-year-project-3e1a4"

set "REGION=%REGION%"
if not defined REGION set "REGION=europe-west1"

set "REALTIME_SERVICE=%REALTIME_SERVICE%"
if not defined REALTIME_SERVICE set "REALTIME_SERVICE=smartcorenting-realtime"

set "REALTIME_SA=%REALTIME_SA%"
if not defined REALTIME_SA set "REALTIME_SA=smartcorenting-realtime-sa@%PROJECT_ID%.iam.gserviceaccount.com"

set "WEB_URL=%~1"
if not defined WEB_URL set "WEB_URL=%WEB_URL%"

if not defined CORS_ORIGINS (
  set "CORS_ORIGINS=http://localhost:3000"
  if defined WEB_URL set "CORS_ORIGINS=http://localhost:3000,%WEB_URL%"
)

for /f %%i in ('powershell -NoProfile -Command "(Get-Date).ToString('yyyyMMddHHmmss')"') do set "TS=%%i"
set "REALTIME_IMAGE=gcr.io/%PROJECT_ID%/%REALTIME_SERVICE%:%TS%"

echo [1/4] Using project: %PROJECT_ID%
call gcloud config set project %PROJECT_ID%
if errorlevel 1 goto :fail

echo [2/4] Building realtime image: %REALTIME_IMAGE%
call gcloud builds submit "%ROOT_DIR%\realtime" --tag %REALTIME_IMAGE%
if errorlevel 1 goto :fail

echo [3/4] Deploying realtime service: %REALTIME_SERVICE%
call gcloud run deploy %REALTIME_SERVICE% ^
  --image %REALTIME_IMAGE% ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --service-account %REALTIME_SA% ^
  --set-secrets FIREBASE_SERVICE_ACCOUNT_KEY=smartcorenting-firebase-service-account:latest ^
  --set-env-vars NODE_ENV=production,CORS_ORIGINS=%CORS_ORIGINS% ^
  --min-instances 0 ^
  --max-instances 10 ^
  --cpu 1 ^
  --memory 512Mi
if errorlevel 1 goto :fail

echo [4/4] Fetching realtime URL
for /f "delims=" %%u in ('gcloud run services describe %REALTIME_SERVICE% --region %REGION% --format="value(status.url)"') do set "REALTIME_URL=%%u"
echo REALTIME_URL=%REALTIME_URL%

goto :eof

:fail
echo Deployment failed.
exit /b 1
