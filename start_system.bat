@echo off
echo =====================================================================
echo   SmartBank BI - Intelligent Banking Decision Support System
echo =====================================================================
echo Starting FastAPI Backend and Vite React Frontend...
echo.

start "SmartBank BI Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak > nul

start "SmartBank BI Frontend (React + Vite)" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo =====================================================================
echo Services Started Successfully!
echo Frontend Application : http://127.0.0.1:5173
echo Backend API Docs     : http://127.0.0.1:8000/docs
echo Demo Login           : admin@smartbank.com / Admin@123
echo =====================================================================
