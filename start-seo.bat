@echo off
TITLE SS-SEO Multi-Site System
ECHO Starting SS-SEO System (Agency Edition)...

:: Set ports
SET FE_PORT=5000
SET BE_PORT=5001

ECHO Backend starting on http://localhost:%BE_PORT%
cd backend
START /B node dist/index.js > ..\backend.log 2>&1

cd ..

ECHO Frontend starting on http://localhost:%FE_PORT%
cd frontend
START /B npx ng serve --port %FE_PORT% --open false > ..\frontend.log 2>&1

cd ..

ECHO.
ECHO System is warming up in the background...
ECHO Dashboard available at: http://localhost:%FE_PORT%
ECHO Logs are being written to backend.log and frontend.log
ECHO.
ECHO You can close this window; the processes will stay alive in the background.
PAUSE
