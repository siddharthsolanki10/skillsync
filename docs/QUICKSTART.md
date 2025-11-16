# SkillSync - Quick Start Guide

## 🚀 Running with Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM available for Docker

### Quick Start (3 Steps)

1. **Copy and configure environment file:**
   ```powershell
   Copy-Item .env.docker .env
   ```
   Then edit `.env` and add your OpenAI API key.

2. **Start all services:**
   ```powershell
   .\start-docker.ps1
   ```
   Or manually:
   ```powershell
   docker-compose up -d
   ```

3. **Configure N8n:**
   - Open http://localhost:5678
   - Login with `admin` / `admin123`
   - Import workflow from `n8n-workflows/skillsync-roadmap-workflow.json`
   - Add OpenAI credentials
   - Activate the workflow

### Access Your Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/api/health
- **N8n**: http://localhost:5678
- **MongoDB**: mongodb://localhost:27017

### Stop Services
```powershell
.\stop-docker.ps1
```
Or:
```powershell
docker-compose down
```

---

## 🛠️ Manual Setup (Without Docker)

### 1. Install Dependencies

**Frontend:**
```powershell
npm install
```

**Backend:**
```powershell
cd backend
npm install
```

### 2. Setup MongoDB

Install MongoDB Community Edition or use MongoDB Atlas (cloud).

### 3. Configure Environment

Copy and edit the backend environment file:
```powershell
cd backend
Copy-Item env.example .env
```

Edit `.env` and configure:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string
- `OPENAI_API_KEY` - Your OpenAI API key
- `N8N_ROADMAP_WEBHOOK_URL` - Your N8n webhook URL

### 4. Start Services

**Terminal 1 - MongoDB:**
```powershell
mongod
```

**Terminal 2 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
npm run dev
```

**Terminal 4 - N8n (Optional):**
```powershell
npx n8n
```

---

## 📚 Documentation

- **Docker Setup**: See [DOCKER-SETUP.md](DOCKER-SETUP.md) for detailed Docker instructions
- **N8n Configuration**: See [docs/n8n-workflow-setup.md](docs/n8n-workflow-setup.md) for N8n workflow details
- **API Documentation**: Backend routes are in `backend/routes/`

---

## 🔧 Troubleshooting

### Docker Issues

**Services won't start:**
- Ensure Docker Desktop is running
- Check if ports are available: 3000, 5000, 5678, 27017
- View logs: `docker-compose logs -f`

**Out of memory:**
- Increase Docker memory in Docker Desktop settings
- Minimum 4GB recommended

### N8n Connection Issues

**Webhook not triggered:**
- Verify workflow is activated in N8n
- Check webhook URL in backend `.env` file
- Ensure N8n container is running: `docker-compose ps n8n`

### Backend API Errors

**Can't connect to MongoDB:**
- Check MongoDB container: `docker-compose logs mongodb`
- Verify connection string in environment variables

**OpenAI API errors:**
- Verify API key is correct in `.env` file
- Check OpenAI credentials in N8n workflow
- Ensure you have API credits available

---

## 🎯 Project Structure

```
SkillSync/
├── backend/              # Express.js backend API
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   └── Dockerfile       # Backend container config
├── src/                 # React frontend
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   └── store/          # Redux store
├── n8n-workflows/       # N8n workflow templates
├── docs/               # Documentation
├── docker-compose.yml  # Docker orchestration
└── Dockerfile          # Frontend container config
```

---

## 🚀 Next Steps

1. **Create an account** in the frontend
2. **Generate a roadmap** for your career path
3. **Track your progress** as you learn
4. **Customize workflows** in N8n for advanced automation

---

## 📞 Support

For issues or questions:
1. Check [DOCKER-SETUP.md](DOCKER-SETUP.md) for detailed troubleshooting
2. Review logs: `docker-compose logs -f`
3. Check N8n workflow execution logs in the N8n UI

---

**Happy Learning! 🎓**
