# SkillSync Docker Stop Script for Windows PowerShell

Write-Host "🛑 Stopping SkillSync Docker Services" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Stop all services
Write-Host "Stopping all containers..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: Data volumes are preserved." -ForegroundColor Yellow
    Write-Host "To remove all data, run: docker-compose down -v" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Failed to stop services!" -ForegroundColor Red
    Write-Host "Try running: docker-compose down --remove-orphans" -ForegroundColor Yellow
}

Write-Host ""
