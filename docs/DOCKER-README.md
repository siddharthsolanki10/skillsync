# 🎉 SkillSync Docker Setup Complete!

Your SkillSync application is now ready to run with Docker! All necessary configuration files have been created.

## 📦 What's Included

### 🐳 Docker Services (4 containers)
1. **MongoDB** - Database (Port 27017)
2. **N8n** - Workflow automation (Port 5678)
3. **Backend** - Express.js API (Port 5000)
4. **Frontend** - React + Vite (Port 3000)

### 🔄 N8n Integration
- AI-powered roadmap generation workflow
- OpenAI GPT-4 integration
- Automatic webhook callbacks to backend
- Structured JSON output for roadmap visualization

## 🚀 Quick Start (5 Minutes)

### 1️⃣ Start Docker Desktop
Open Docker Desktop and wait for it to start.

### 2️⃣ Configure Environment
```powershell
Copy-Item .env.docker .env
notepad .env
```
Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3️⃣ Start Everything
```powershell
.\start-docker.ps1
```
This will:
- ✅ Pull Docker images (first time only)
- ✅ Start all 4 services
- ✅ Initialize MongoDB with database and collections
- ✅ Configure networking between containers
- ✅ Display service URLs

### 4️⃣ Configure N8n
1. Open http://localhost:5678
2. Login: `admin` / `admin123`
3. Click "Workflows" → "Import from File"
4. Select `n8n-workflows/skillsync-roadmap-workflow.json`
5. Go to "Credentials" → "New" → "OpenAI API"
6. Add your OpenAI API key
7. Open the workflow → Select the "OpenAI GPT-4" node → Choose your credential
8. **Activate the workflow** (toggle at top)

### 5️⃣ Use Your App!
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **N8n**: http://localhost:5678

## 🎯 How It Works

```
User (Frontend) → Backend API → N8n Webhook → OpenAI GPT-4 
                                      ↓
                            Generate Roadmap JSON
                                      ↓
                            Callback to Backend
                                      ↓
                              Save to MongoDB
                                      ↓
                          Display to User (Charts)
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **SETUP-SUMMARY.md** | Complete overview and troubleshooting |
| **DOCKER-SETUP.md** | Detailed Docker instructions |
| **QUICKSTART.md** | Quick start guide (Docker + Manual) |
| **docker-compose.yml** | Service orchestration |
| **start-docker.ps1** | Windows startup script |
| **stop-docker.ps1** | Windows stop script |

## 🛠️ Common Commands

### View Service Status
```powershell
docker-compose ps
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f n8n
```

### Restart a Service
```powershell
docker-compose restart backend
docker-compose restart frontend
```

### Stop Everything
```powershell
.\stop-docker.ps1
# OR
docker-compose down
```

### Rebuild After Changes
```powershell
docker-compose up -d --build
```

## 🔍 Testing the Integration

### Test Backend Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

### Test N8n Webhook
```powershell
$body = @{
    field = "Web Development"
    level = "Beginner"
    userId = "test123"
    roadmapId = "test-roadmap-1"
    callbackUrl = "http://backend:5000/api/roadmaps/webhook/n8n-callback"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/skillsync-roadmap-generation" -Method POST -Body $body -ContentType "application/json"
```

## 🐛 Troubleshooting

### Docker Not Running
**Error**: "error during connect"
**Solution**: Start Docker Desktop from Start Menu

### Port Already in Use
**Error**: "Bind for 0.0.0.0:3000 failed"
**Solution**: 
- Stop other services using the port
- OR change ports in `docker-compose.yml`

### MongoDB Connection Issues
**Solution**: Wait 30 seconds and restart backend:
```powershell
docker-compose restart backend
```

### N8n Webhook Not Working
**Solution**:
1. Check workflow is activated in N8n UI
2. Verify OpenAI credentials are added
3. Check logs: `docker-compose logs n8n`

### Hot Reload Not Working
**Solution**:
- Clear browser cache
- Restart service: `docker-compose restart frontend`

## 🔐 Security Notes

### Default Credentials (Development)
- MongoDB: `admin` / `adminpassword`
- N8n: `admin` / `admin123`

### ⚠️ For Production
Change these in `docker-compose.yml`:
- `MONGO_INITDB_ROOT_PASSWORD`
- `N8N_BASIC_AUTH_USER` and `N8N_BASIC_AUTH_PASSWORD`
- `JWT_SECRET`
- `N8N_WEBHOOK_SECRET`

## 📊 Container Details

| Service | Container Name | Port | Hot Reload |
|---------|---------------|------|------------|
| Frontend | skillsync-frontend | 3000 | ✅ Yes |
| Backend | skillsync-backend | 5000 | ✅ Yes |
| N8n | skillsync-n8n | 5678 | N/A |
| MongoDB | skillsync-mongodb | 27017 | N/A |

## 🎓 Features You Can Try

1. **Create an Account**
   - Go to http://localhost:3000
   - Sign up with email and password

2. **Generate AI Roadmap**
   - Login to your account
   - Go to "Generate Roadmap"
   - Select career field and level
   - Watch N8n create your personalized path!

3. **View Interactive Charts**
   - See your roadmap as flowcharts
   - Interactive phase and step details
   - Progress tracking

4. **Monitor N8n Executions**
   - Go to http://localhost:5678
   - View "Executions" tab
   - See real-time AI generation

## 🎯 Project Structure

```
SkillSync/
├── docker-compose.yml          # Main orchestration
├── Dockerfile                  # Frontend container
├── start-docker.ps1           # Startup script
├── stop-docker.ps1            # Stop script
├── .env.docker                # Environment template
├── mongo-init.js              # DB initialization
├── vite.config.js             # Vite (Docker-ready)
│
├── backend/
│   ├── Dockerfile             # Backend container
│   ├── server.js              # Express server
│   ├── routes/
│   │   └── roadmaps.js        # Roadmap API (N8n integration)
│   └── models/
│       └── Roadmap.js         # Roadmap model
│
├── n8n-workflows/
│   └── skillsync-roadmap-workflow.json  # N8n workflow
│
├── src/                       # React frontend
│   ├── pages/
│   │   ├── RoadmapGenerator.jsx
│   │   └── RoadmapView.jsx
│   └── components/
│       └── charts/
│
└── docs/
    └── n8n-workflow-setup.md  # N8n documentation
```

## 💡 Tips

1. **First startup takes 2-3 minutes** - Docker needs to download images
2. **MongoDB takes 30 seconds to initialize** - Backend might restart once
3. **Hot reload works** - Edit code and see changes instantly
4. **Check logs frequently** - `docker-compose logs -f` is your friend
5. **N8n workflows persist** - Saved in `n8n_data` volume

## 📞 Need Help?

1. **Check logs**: `docker-compose logs -f [service-name]`
2. **Read docs**: See SETUP-SUMMARY.md for troubleshooting
3. **Verify services**: `docker-compose ps`
4. **Check N8n executions**: http://localhost:5678 → Executions tab

## ✅ Checklist

- [ ] Docker Desktop installed and running
- [ ] Environment file created (`.env`)
- [ ] OpenAI API key added to `.env`
- [ ] Services started with `.\start-docker.ps1`
- [ ] N8n workflow imported
- [ ] OpenAI credentials added in N8n
- [ ] Workflow activated in N8n
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check passes

## 🎉 You're Ready!

Your SkillSync platform with N8n integration is now fully configured and ready to use!

**Next**: Open http://localhost:3000 and start creating AI-powered learning roadmaps!

---

**Need more help?** See:
- `SETUP-SUMMARY.md` - Complete technical overview
- `DOCKER-SETUP.md` - Detailed Docker guide
- `docs/n8n-workflow-setup.md` - N8n workflow details
