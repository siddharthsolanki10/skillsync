# SkillSync Docker Startup Script for Windows PowerShell
# This script helps you start the entire SkillSync application with Docker

Write-Host "🚀 SkillSync Docker Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.docker") {
        Copy-Item ".env.docker" ".env"
        Write-Host "✅ .env file created. Please edit it and add your API keys!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Required: Add your OpenAI API key in .env file" -ForegroundColor Red
        Write-Host "Press any key to open .env file in notepad..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        notepad .env
        Write-Host ""
        Write-Host "After adding your API keys, press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "❌ .env.docker template not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Starting SkillSync services..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
Write-Host ""

# Start Docker Compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service URLs:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Frontend:       http://localhost:3000" -ForegroundColor White
    Write-Host "Backend API:    http://localhost:5000/api/health" -ForegroundColor White
    Write-Host "N8n Workflows:  http://localhost:5678" -ForegroundColor White
    Write-Host "MongoDB:        mongodb://localhost:27017" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 N8n Login Credentials:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Username: admin" -ForegroundColor White
    Write-Host "Password: admin123" -ForegroundColor White
    Write-Host "⚠️  Change these in production!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "1. Open N8n at http://localhost:5678" -ForegroundColor White
    Write-Host "2. Import workflow from: n8n-workflows/skillsync-roadmap-workflow.json" -ForegroundColor White
    Write-Host "3. Add your OpenAI API credentials in N8n" -ForegroundColor White
    Write-Host "4. Activate the workflow" -ForegroundColor White
    Write-Host "5. Open frontend at http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For detailed instructions, see: DOCKER-SETUP.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🛠️  Useful Commands:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "View logs:      docker-compose logs -f" -ForegroundColor White
    Write-Host "Stop services:  docker-compose down" -ForegroundColor White
    Write-Host "Restart:        docker-compose restart" -ForegroundColor White
    Write-Host ""
    
    # Wait a few seconds and check service health
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host ""
    Write-Host "🔍 Service Status:" -ForegroundColor Cyan
    docker-compose ps
    
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Ports already in use (3000, 5000, 5678, 27017)" -ForegroundColor White
    Write-Host "- Not enough Docker resources allocated" -ForegroundColor White
    Write-Host "- Missing environment variables in .env file" -ForegroundColor White
    Write-Host ""
    Write-Host "View detailed logs:" -ForegroundColor Yellow
    Write-Host "docker-compose logs" -ForegroundColor White
}
