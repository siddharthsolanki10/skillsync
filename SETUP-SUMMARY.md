# SkillSync Docker Configuration - Complete Setup Summary

## ✅ What Has Been Created

All necessary Docker configuration files have been created for running SkillSync with N8n integration locally.

### 📁 Files Created

1. **`docker-compose.yml`** - Main orchestration file (MongoDB, N8n, Backend, Frontend)
2. **`Dockerfile`** - Frontend container configuration
3. **`backend/Dockerfile`** - Backend container configuration
4. **`.dockerignore`** - Frontend Docker ignore rules
5. **`backend/.dockerignore`** - Backend Docker ignore rules
6. **`.env.docker`** - Environment template for Docker
7. **`mongo-init.js`** - MongoDB initialization script
8. **`n8n-workflows/skillsync-roadmap-workflow.json`** - N8n workflow template
9. **`start-docker.ps1`** - Windows PowerShell startup script
10. **`stop-docker.ps1`** - Windows PowerShell stop script
11. **`DOCKER-SETUP.md`** - Detailed Docker documentation
12. **`QUICKSTART.md`** - Quick start guide
13. **`vite.config.js`** - Updated with Docker-compatible settings

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SkillSync Platform                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Frontend   │      │   Backend    │                │
│  │  React+Vite  │◄────►│  Express.js  │                │
│  │  Port: 3000  │      │  Port: 5000  │                │
│  └──────────────┘      └───────┬──────┘                │
│         │                      │                        │
│         │              ┌───────▼──────┐                │
│         │              │   MongoDB    │                │
│         │              │  Port: 27017 │                │
│         │              └───────┬──────┘                │
│         │                      │                        │
│         └──────────────┬───────┘                        │
│                        │                                │
│                ┌───────▼──────┐                        │
│                │     N8n      │                        │
│                │  Workflows   │                        │
│                │  Port: 5678  │                        │
│                └──────────────┘                        │
│                        │                                │
│                        ▼                                │
│                  OpenAI GPT-4                          │
│             (AI Roadmap Generation)                    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 How to Run

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your Windows machine.

### Step 2: Configure Environment
```powershell
# Copy the environment template
Copy-Item .env.docker .env

# Edit .env and add your OpenAI API key
notepad .env
```

Add your API key:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### Step 3: Start All Services
```powershell
# Using the startup script (Recommended)
.\start-docker.ps1

# OR manually with docker-compose
docker-compose up -d
```

### Step 4: Configure N8n
1. Open http://localhost:5678 in your browser
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Import the workflow:
   - Click "Workflows" → "Import from File"
   - Select `n8n-workflows/skillsync-roadmap-workflow.json`
4. Add OpenAI credentials:
   - Go to "Credentials" → "New"
   - Select "OpenAI API"
   - Enter your API key
   - Save
5. Update the workflow:
   - Open the imported workflow
   - Click on "OpenAI GPT-4" node
   - Select your saved credentials
   - Save the workflow
6. Activate the workflow (toggle at the top)

### Step 5: Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **N8n Dashboard**: http://localhost:5678
- **MongoDB**: mongodb://localhost:27017 (for database tools)

## 🔧 Service Details

### MongoDB
- **Container Name**: `skillsync-mongodb`
- **Port**: 27017
- **Database**: skillsync
- **Admin Credentials**: admin / adminpassword
- **Volume**: Persistent data in `mongodb_data`

### N8n Automation
- **Container Name**: `skillsync-n8n`
- **Port**: 5678
- **Default Login**: admin / admin123 (change in production!)
- **Volume**: Workflows saved in `n8n_data`
- **Webhook Endpoint**: http://localhost:5678/webhook/skillsync-roadmap-generation

### Backend API
- **Container Name**: `skillsync-backend`
- **Port**: 5000
- **Hot Reload**: Yes (with nodemon)
- **Environment**: Development
- **Health Check**: http://localhost:5000/api/health

### Frontend (React + Vite)
- **Container Name**: `skillsync-frontend`
- **Port**: 3000
- **Hot Reload**: Yes (HMR enabled)
- **Dev Server**: Vite with polling for Docker

## 🛠️ Useful Commands

### View All Services
```powershell
docker-compose ps
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f n8n
docker-compose logs -f mongodb
```

### Restart Services
```powershell
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Services
```powershell
# Using stop script
.\stop-docker.ps1

# OR manually
docker-compose down
```

### Rebuild After Changes
```powershell
docker-compose up -d --build
```

### Access Container Shell
```powershell
# Backend
docker exec -it skillsync-backend sh

# MongoDB
docker exec -it skillsync-mongodb mongosh -u admin -p adminpassword --authenticationDatabase admin
```

## 🔍 Testing the N8n Integration

### 1. Test Webhook Directly
```powershell
# Test the N8n webhook
$body = @{
    field = "Web Development"
    level = "Beginner"
    userId = "test123"
    roadmapId = "test-roadmap-1"
    callbackUrl = "http://backend:5000/api/roadmaps/webhook/n8n-callback"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/skillsync-roadmap-generation" -Method POST -Body $body -ContentType "application/json"
```

### 2. Test via Backend API
```powershell
# Login to get JWT token first
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# Generate roadmap
$roadmapBody = @{
    field = "Web Development"
    level = "Beginner"
    customRequirements = "Focus on modern frameworks"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/roadmaps/generate" -Method POST -Body $roadmapBody -ContentType "application/json" -Headers $headers
```

### 3. Monitor N8n Executions
- Go to http://localhost:5678
- Click "Executions" in the left sidebar
- Watch real-time workflow executions
- Debug any errors in the execution details

## 📊 Data Flow

### Roadmap Generation Flow
```
User Request (Frontend)
    ↓
Backend API (/api/roadmaps/generate)
    ↓
N8n Webhook Trigger
    ↓
Validate & Prepare Data
    ↓
OpenAI GPT-4 (Generate Roadmap)
    ↓
Format Response (Parse JSON)
    ↓
Callback to Backend
    ↓
Save to MongoDB
    ↓
Send Response to Frontend
    ↓
Display Interactive Roadmap
```

## 🐛 Troubleshooting

### Docker Desktop Not Running
**Error**: `error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine"`

**Solution**: Start Docker Desktop from the Start Menu

### Port Already in Use
**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**: 
- Stop other services using the port
- OR change the port in `docker-compose.yml`

### MongoDB Connection Failed
**Error**: Backend can't connect to MongoDB

**Solution**:
1. Check MongoDB container: `docker-compose logs mongodb`
2. Wait for MongoDB to be fully ready (can take 30 seconds)
3. Restart backend: `docker-compose restart backend`

### N8n Webhook Not Responding
**Error**: Webhook returns 404 or times out

**Solution**:
1. Verify workflow is activated in N8n UI
2. Check webhook path matches environment variable
3. View N8n logs: `docker-compose logs n8n`

### Hot Reload Not Working
**Error**: Changes in code don't reflect in browser

**Solution**:
- Frontend: `docker-compose restart frontend`
- Backend: `docker-compose restart backend`
- Clear browser cache

### OpenAI API Errors
**Error**: "Invalid API key" or "Quota exceeded"

**Solution**:
1. Verify API key in `.env` file
2. Check OpenAI credentials in N8n workflow
3. Ensure you have credits in your OpenAI account

## 🔐 Security Notes

### For Development
The current setup uses default passwords for ease of development. This is fine for local development.

### For Production
**⚠️ IMPORTANT**: Change these before deploying to production:

1. **MongoDB Credentials**:
   ```yaml
   MONGO_INITDB_ROOT_PASSWORD: your-strong-password-here
   ```

2. **N8n Credentials**:
   ```yaml
   N8N_BASIC_AUTH_USER: your-username
   N8N_BASIC_AUTH_PASSWORD: your-strong-password
   ```

3. **JWT Secret**:
   ```yaml
   JWT_SECRET: generate-a-secure-random-string-min-32-chars
   ```

4. **N8n Webhook Secret**:
   ```yaml
   N8N_WEBHOOK_SECRET: another-secure-random-string
   ```

5. **Enable SSL/TLS** using a reverse proxy (Nginx/Traefik)

## 📚 Additional Resources

- **Detailed Setup**: See `DOCKER-SETUP.md`
- **Quick Start**: See `QUICKSTART.md`
- **N8n Workflows**: See `docs/n8n-workflow-setup.md`
- **API Documentation**: Check backend routes in `backend/routes/`

## 🎓 Learning Path

1. ✅ Setup Docker environment
2. ✅ Configure N8n workflow
3. ✅ Test roadmap generation
4. 📝 Customize workflow prompts
5. 📝 Add more automation workflows
6. 📝 Deploy to production

## 📞 Support

If you encounter issues:
1. Check this document first
2. Review logs: `docker-compose logs -f`
3. Verify all environment variables
4. Check N8n execution logs
5. Ensure Docker has enough resources (4GB+ RAM)

---

**Created**: October 14, 2025
**Status**: ✅ Ready to Use
**Next Step**: Start Docker Desktop and run `.\start-docker.ps1`
