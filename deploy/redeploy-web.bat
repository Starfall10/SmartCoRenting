@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "ROOT_DIR=%%~fI"
if exist "%SCRIPT_DIR%set-env.bat" (
  call "%SCRIPT_DIR%set-env.bat"
)

set "REALTIME_URL=%~1"
if not defined REALTIME_URL set "REALTIME_URL=%REALTIME_URL%"
if not defined REALTIME_URL (
  echo Missing REALTIME_URL. Usage: redeploy-web.bat REALTIME_URL [APP_BASE_URL]
  exit /b 1
)

set "APP_BASE_URL=%~2"
if not defined APP_BASE_URL set "APP_BASE_URL=%APP_BASE_URL%"
if not defined APP_BASE_URL set "APP_BASE_URL=https://placeholder.example.com"

set "PROJECT_ID=%PROJECT_ID%"
if not defined PROJECT_ID set "PROJECT_ID=final-year-project-3e1a4"

set "REGION=%REGION%"
if not defined REGION set "REGION=europe-west1"

set "WEB_SERVICE=%WEB_SERVICE%"
if not defined WEB_SERVICE set "WEB_SERVICE=smartcorenting-web"

set "WEB_SA=%WEB_SA%"
if not defined WEB_SA set "WEB_SA=smartcorenting-web-sa@%PROJECT_ID%.iam.gserviceaccount.com"

set "RESEND_FROM_EMAIL=%RESEND_FROM_EMAIL%"
if not defined RESEND_FROM_EMAIL set "RESEND_FROM_EMAIL=onboarding@resend.dev"

for %%v in (
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
) do (
  if not defined %%v (
    echo Missing required env var: %%v
    echo Create deploy\set-env.bat from deploy\set-env.example.bat, then rerun.
    exit /b 1
  )
)

for /f %%i in ('powershell -NoProfile -Command "(Get-Date).ToString('yyyyMMddHHmmss')"') do set "TS=%%i"
set "WEB_IMAGE=gcr.io/%PROJECT_ID%/%WEB_SERVICE%:%TS%"

echo [1/5] Using project: %PROJECT_ID%
call gcloud config set project %PROJECT_ID%
if errorlevel 1 goto :fail

echo [2/5] Building web image with build-time NEXT_PUBLIC vars
call gcloud builds submit "%ROOT_DIR%\smartcorenting" ^
  --config "%ROOT_DIR%\smartcorenting\cloudbuild.web.yaml" ^
  --substitutions "_WEB_IMAGE=%WEB_IMAGE%,_NEXT_PUBLIC_FIREBASE_API_KEY=%NEXT_PUBLIC_FIREBASE_API_KEY%,_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%,_NEXT_PUBLIC_FIREBASE_PROJECT_ID=%NEXT_PUBLIC_FIREBASE_PROJECT_ID%,_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET%,_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%,_NEXT_PUBLIC_FIREBASE_APP_ID=%NEXT_PUBLIC_FIREBASE_APP_ID%,_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=%NEXT_PUBLIC_GOOGLE_MAPS_API_KEY%,_NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=%NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID%,_NEXT_PUBLIC_SOCKET_URL=%REALTIME_URL%"
if errorlevel 1 goto :fail

echo [3/5] Deploying web service: %WEB_SERVICE%
call gcloud run deploy %WEB_SERVICE% ^
  --image %WEB_IMAGE% ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --service-account %WEB_SA% ^
  --set-secrets FIREBASE_SERVICE_ACCOUNT_KEY=smartcorenting-firebase-service-account:latest,RESEND_API_KEY=smartcorenting-resend-api-key:latest ^
  --set-env-vars NODE_ENV=production,RESEND_FROM_EMAIL=%RESEND_FROM_EMAIL%,APP_BASE_URL=%APP_BASE_URL% ^
  --min-instances 0 ^
  --max-instances 10 ^
  --cpu 1 ^
  --memory 1Gi
if errorlevel 1 goto :fail

echo [4/5] Fetching web URL
for /f "delims=" %%u in ('gcloud run services describe %WEB_SERVICE% --region %REGION% --format="value(status.url)"') do set "WEB_URL=%%u"
echo WEB_URL=%WEB_URL%

echo [5/5] Updating APP_BASE_URL to deployed URL
call gcloud run services update %WEB_SERVICE% --region %REGION% --update-env-vars APP_BASE_URL=%WEB_URL%
if errorlevel 1 goto :fail

goto :eof

:fail
echo Deployment failed.
exit /b 1
