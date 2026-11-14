# SmartBank BI Launch Script for Windows 11 PowerShell

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  SmartBank BI - Intelligent Banking Decision Support System" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "`n[*] Starting Backend FastAPI Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$CurrentDir\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[*] Starting Frontend Vite React Interface..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$CurrentDir\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "  SMARTBANK BI LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  Frontend Dashboard : http://127.0.0.1:5173" -ForegroundColor White
Write-Host "  Backend Swagger UI : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  Demo Credentials:" -ForegroundColor White
Write-Host "    - Admin           : admin@smartbank.com / Admin@123" -ForegroundColor Gray
Write-Host "    - Banking Manager : manager@smartbank.com / Manager@123" -ForegroundColor Gray
Write-Host "    - Loan Officer    : loanofficer@smartbank.com / Officer@123" -ForegroundColor Gray
Write-Host "=====================================================================`n" -ForegroundColor Green
