# ============================================
# Start NayiBareilly Development Environment
# ============================================

Write-Host ""
Write-Host "🚀 Starting NayiBareilly Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Set development environment
$env:NODE_ENV = "development"

Write-Host "📋 Environment Configuration:" -ForegroundColor Yellow
Write-Host "  Node Environment: development" -ForegroundColor Gray
Write-Host "  Frontend URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "  Backend URL: http://localhost:4001" -ForegroundColor Gray
Write-Host "  API URL: http://localhost:4001/api" -ForegroundColor Gray
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check if ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow

$serverPortInUse = Test-Port -Port 4001
$clientPortInUse = Test-Port -Port 3000

if ($serverPortInUse) {
    Write-Host "  ⚠️  Port 4001 (server) is already in use" -ForegroundColor Yellow
}

if ($clientPortInUse) {
    Write-Host "  ⚠️  Port 3000 (client) is already in use" -ForegroundColor Yellow
}

if (-not $serverPortInUse -and -not $clientPortInUse) {
    Write-Host "  ✅ Ports 3000 and 4001 are available" -ForegroundColor Green
}
Write-Host ""

# Start server in background
Write-Host "📡 Starting Backend Server..." -ForegroundColor Green
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "server"
    $env:NODE_ENV = "development"
    npm run dev
}

Write-Host "  Server starting in background (Job ID: $($serverJob.Id))" -ForegroundColor Gray

# Wait for server to start
Write-Host "  Waiting for server to initialize..." -ForegroundColor Yellow
$maxWaitTime = 30 # seconds
$waitTime = 0
$serverReady = $false

while ($waitTime -lt $maxWaitTime -and -not $serverReady) {
    Start-Sleep -Seconds 1
    $waitTime++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4001/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
        }
    } catch {
        # Server not ready yet
    }
    
    # Show progress
    if ($waitTime % 5 -eq 0) {
        Write-Host "  Still waiting... ($waitTime/$maxWaitTime seconds)" -ForegroundColor Gray
    }
}

if ($serverReady) {
    Write-Host "  ✅ Server is running and responding" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Server may still be starting (continuing anyway)" -ForegroundColor Yellow
}

Write-Host ""

# Start client
Write-Host "🌐 Starting Frontend Client..." -ForegroundColor Green
Write-Host "  This will open your browser to http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Set-Location "client"

try {
    # Start the client (this will block until stopped)
    npm run dev
} finally {
    # Clean up: stop the server job when client stops
    Write-Host ""
    Write-Host "🛑 Stopping development environment..." -ForegroundColor Yellow
    
    if (Get-Job -Id $serverJob.Id -ErrorAction SilentlyContinue) {
        Stop-Job -Job $serverJob
        Remove-Job -Job $serverJob
        Write-Host "  Server stopped" -ForegroundColor Gray
    }
    
    Write-Host "  ✅ Development environment stopped" -ForegroundColor Green
    Set-Location ".."
}