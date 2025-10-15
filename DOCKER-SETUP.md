# SkillSync Docker Setup Guide

This guide explains how to run SkillSync with N8n, MongoDB, Backend, and Frontend using Docker.

## 📋 Prerequisites

- Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0 or higher
- At least 4GB of RAM available for Docker
- Ports 3000, 5000, 5678, and 27017 available

## 🚀 Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.docker .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- **MongoDB** on port `27017`
- **N8n** on port `5678`
- **Backend API** on port `5000`
- **Frontend** on port `3000`

### 3. Verify Services

Check if all containers are running:

```bash
docker-compose ps
```

You should see all services with status "Up".

### 4. Access the Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **N8n Workflow**: http://localhost:5678
- **MongoDB**: mongodb://localhost:27017

## 🔧 N8n Configuration

### First Time Setup

1. Open N8n at http://localhost:5678
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
   - **⚠️ Change these in production!**

### Import SkillSync Workflow

1. In N8n, click on "Workflows" → "Import from File"
2. Select `n8n-workflows/skillsync-roadmap-workflow.json`
3. The workflow will be imported and ready to use

### Configure OpenAI Credentials in N8n

1. Go to "Credentials" → "New"
2. Select "OpenAI API"
3. Add your OpenAI API key
4. Save the credential
5. Go back to the imported workflow
6. Select the "OpenAI GPT-4" node
7. Choose the credential you just created
8. Save the workflow
9. **Activate the workflow** by toggling the switch at the top

## 📊 Service Details

### MongoDB
- **Container**: `skillsync-mongodb`
- **Port**: 27017
- **Database**: skillsync
- **Admin User**: admin
- **Admin Password**: adminpassword (change in production)
- **Data Volume**: Persistent storage in `mongodb_data`

### N8n Workflow Automation
- **Container**: `skillsync-n8n`
- **Port**: 5678
- **Username**: admin
- **Password**: admin123
- **Data Volume**: Persistent storage in `n8n_data`
- **Webhook URL**: http://localhost:5678/webhook/skillsync-roadmap-generation

### Backend API
- **Container**: `skillsync-backend`
- **Port**: 5000
- **Health Check**: http://localhost:5000/api/health
- **Hot Reload**: Enabled with volume mounting

### Frontend
- **Container**: `skillsync-frontend`
- **Port**: 3000
- **Hot Reload**: Enabled with volume mounting
- **Vite Dev Server**: Running with HMR

## 🛠️ Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f n8n
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart n8n
```

### Rebuild Containers
```bash
docker-compose up -d --build
```

### Execute Commands in Container
```bash
# Access backend container
docker exec -it skillsync-backend sh

# Access MongoDB
docker exec -it skillsync-mongodb mongosh -u admin -p adminpassword --authenticationDatabase admin

# Access N8n container
docker exec -it skillsync-n8n sh
```

## 🔍 Troubleshooting

### Port Already in Use

If you get port conflicts, you can change the ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Change host port to 3001
```

### MongoDB Connection Issues

If the backend can't connect to MongoDB, check:
1. MongoDB container is healthy: `docker-compose ps`
2. MongoDB logs: `docker-compose logs mongodb`
3. Connection string in backend environment variables

### N8n Webhook Not Working

1. Ensure N8n is running: `docker-compose ps n8n`
2. Check N8n logs: `docker-compose logs n8n`
3. Verify the workflow is activated in N8n UI
4. Check webhook URL is correct in backend environment

### Backend API Errors

1. Check backend logs: `docker-compose logs backend`
2. Verify all environment variables are set correctly
3. Ensure MongoDB is healthy
4. Check if N8n is accessible from backend

### Frontend Not Loading

1. Check frontend logs: `docker-compose logs frontend`
2. Verify backend is running: http://localhost:5000/api/health
3. Clear browser cache
4. Check VITE_API_URL in frontend environment

## 🔐 Production Deployment

For production, update these in `docker-compose.yml`:

1. **Change Default Passwords**:
   ```yaml
   MONGO_INITDB_ROOT_PASSWORD: use-strong-password-here
   N8N_BASIC_AUTH_PASSWORD: use-strong-password-here
   JWT_SECRET: generate-secure-random-string
   N8N_WEBHOOK_SECRET: generate-secure-random-string
   ```

2. **Use Environment Variables**:
   ```yaml
   environment:
     - JWT_SECRET=${JWT_SECRET}
     - MONGO_PASSWORD=${MONGO_PASSWORD}
   ```

3. **Enable SSL/TLS**:
   - Configure reverse proxy (Nginx/Traefik)
   - Use Let's Encrypt for SSL certificates
   - Update N8N_PROTOCOL to https

4. **Set NODE_ENV to production**:
   ```yaml
   NODE_ENV: production
   ```

## 📈 Monitoring

### Health Checks

All services have health checks configured:

```bash
# Check all services health
docker-compose ps

# Test backend health
curl http://localhost:5000/api/health

# Test N8n health
curl http://localhost:5678/healthz
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats skillsync-backend
```

## 🔄 Backup and Restore

### Backup MongoDB Data

```bash
docker exec skillsync-mongodb mongodump --out /backup --authenticationDatabase admin -u admin -p adminpassword
docker cp skillsync-mongodb:/backup ./mongodb-backup
```

### Restore MongoDB Data

```bash
docker cp ./mongodb-backup skillsync-mongodb:/backup
docker exec skillsync-mongodb mongorestore /backup --authenticationDatabase admin -u admin -p adminpassword
```

### Backup N8n Workflows

```bash
docker cp skillsync-n8n:/home/node/.n8n/workflows ./n8n-backup
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [N8n Documentation](https://docs.n8n.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🐛 Known Issues

1. **First startup may be slow** - Initial image downloads can take time
2. **Hot reload may not work on Windows** - Use WSL2 for better performance
3. **MongoDB initialization** - First connection may timeout, just restart backend

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all environment variables are set
3. Ensure Docker has enough resources allocated
4. Check firewall settings for the required ports

---

**Happy Coding! 🚀**
