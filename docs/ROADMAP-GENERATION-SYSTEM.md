# Complete Career Roadmap Generation System

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Endpoints](#api-endpoints)
5. [n8n Workflow Details](#n8n-workflow-details)
6. [Frontend Integration](#frontend-integration)
7. [Example Payloads](#example-payloads)
8. [Error Handling](#error-handling)
9. [Security Considerations](#security-considerations)
10. [Deployment Guide](#deployment-guide)

---

## System Overview

The Career Roadmap Generation System is a full-stack application that:

- **Generates** AI-powered career roadmaps using OpenAI's GPT-4
- **Stores** structured roadmap data in MongoDB
- **Delivers** comprehensive learning paths with resources and checklists
- **Tracks** user progress and roadmap popularity
- **Integrates** React frontend with Node.js backend via n8n automation

### Key Features

✅ AI-generated personalized career roadmaps  
✅ 5-6 phase learning structure  
✅ Free and paid resource recommendations  
✅ 30-day daily learning checklist  
✅ Capstone project suggestions  
✅ Real-time progress tracking  
✅ Search and filter by career field  
✅ User authentication & authorization  

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  - Career field selection                                   │
│  - Roadmap display with visualization                       │
│  - Progress tracking                                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST /api/roadmaps/generate
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                    │
│  - Authentication & Authorization                           │
│  - Request validation                                       │
│  - n8n Webhook trigger                                      │
│  - Database operations                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ Webhook Call
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  n8n WORKFLOW                               │
│  1. Webhook Trigger                                         │
│  2. OpenAI API Call (GPT-4)                                │
│  3. Parse & Validate JSON                                  │
│  4. Save to MongoDB (HTTP Request)                         │
│  5. Validate & Format Response                             │
│  6. Return to Frontend                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                             │
│  - Roadmap Collection                                       │
│  - User Collection (linked)                                 │
│  - Indexes for performance                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Prerequisites

```bash
# Required software
- Node.js v16+
- MongoDB v4.4+
- n8n (self-hosted or cloud)
- OpenAI API key
```

### 2. Environment Variables

Create `.env` file in backend root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsync

# JWT
JWT_SECRET=your-secure-random-string
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# n8n
N8N_BASE_URL=http://localhost:5678
N8N_ROADMAP_WEBHOOK_URL=http://localhost:5678/webhook/uuid

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../src
npm install
```

### 4. Setup n8n

```bash
# Start n8n
n8n start

# Access at http://localhost:5678
# Create credentials for:
# - OpenAI API
# - MongoDB (if using direct connection)
```

### 5. Import n8n Workflow

1. Open n8n dashboard
2. Import workflow from `n8n-workflows/skillsync-ai-roadmap-generation.json`
3. Configure:
   - OpenAI credentials
   - Backend API URL
   - Webhook path
4. Activate workflow

### 6. Start Application

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd src
npm start

# Terminal 3: n8n (if not running as service)
n8n start
```

---

## API Endpoints

### Authentication Required (JWT Bearer Token)

#### 1. Generate Roadmap

```http
POST /api/roadmaps/generate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "careerField": "Web Development"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Roadmap generation started",
  "workflowStatus": {
    "status": "processing"
  }
}
```

---

#### 2. Create Roadmap (Called by n8n)

```http
POST /api/roadmaps
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "careerField": "Web Development",
  "title": "Full Stack Web Development Roadmap",
  "description": "Complete guide to becoming...",
  "stages": [...],
  "resources": {...},
  "dailyChecklist": {...},
  "generatedAt": "2024-11-17T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "roadmapId": "507f1f77bcf86cd799439011",
  "title": "Full Stack Web Development Roadmap",
  "stages": 5,
  "message": "Roadmap created successfully",
  "data": {...}
}
```

---

#### 3. Get All Roadmaps

```http
GET /api/roadmaps?field=Web%20Development&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10
  }
}
```

---

#### 4. Get Single Roadmap

```http
GET /api/roadmaps/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Full Stack Web Development Roadmap",
    ...
  }
}
```

---

#### 5. Get User's Roadmaps

```http
GET /api/roadmaps/user/:userId
Authorization: Bearer <JWT_TOKEN>
```

---

#### 6. Update Roadmap

```http
PUT /api/roadmaps/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new", "tags"]
}
```

---

#### 7. Delete Roadmap

```http
DELETE /api/roadmaps/:id
Authorization: Bearer <JWT_TOKEN>
```

---

#### 8. Mark as Helpful

```http
POST /api/roadmaps/:id/mark-helpful
```

**Response:**
```json
{
  "success": true,
  "helpful": 15,
  "message": "Thank you for the feedback!"
}
```

---

## n8n Workflow Details

### Workflow Nodes

#### 1. **Webhook Trigger**
- **Type:** Webhook
- **Method:** POST
- **Purpose:** Receives requests from React frontend
- **Input Schema:**
```json
{
  "careerField": "string (required)",
  "userId": "string (required)",
  "token": "string (JWT)"
}
```

---

#### 2. **OpenAI GPT-4 Call**
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://api.openai.com/v1/chat/completions`
- **Headers:**
  - `Authorization: Bearer {{ $secrets.OPENAI_API_KEY }}`
  - `Content-Type: application/json`

- **Body:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Generate a comprehensive career roadmap in JSON format for: {{ $node[\"Webhook_Trigger\"].json.body.careerField }}. Include phases, skills, resources, and time estimates. Return ONLY valid JSON."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

---

#### 3. **Parse & Prepare Data**
- **Type:** Function/Script
- **Language:** JavaScript
- **Purpose:** Extract JSON from OpenAI response
- **Logic:**
  - Remove markdown code blocks
  - Parse JSON string
  - Add metadata (userId, timestamp)
  - Validate structure

- **Code:**
```javascript
const response = items[0].json.body;
const content = response.choices[0].message.content;
let jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

const roadmapData = JSON.parse(jsonStr);
return {
  roadmap: roadmapData,
  careerField: "{{ $node[\"Webhook_Trigger\"].json.body.careerField }}",
  generatedAt: new Date().toISOString(),
  success: true
};
```

---

#### 4. **Save to MongoDB**
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{{ $secrets.BACKEND_URL }}/api/roadmaps`
- **Purpose:** Store roadmap in database
- **Headers:**
  - `Authorization: Bearer {{ $node["Webhook_Trigger"].json.body.token }}`
  - `Content-Type: application/json`

- **Body:** Complete roadmap structure

---

#### 5. **Validate Save Response**
- **Type:** Function/Script
- **Purpose:** Verify save success and extract ID
- **Error Handling:**
  - Check for save errors
  - Throw exception if failed
  - Extract roadmapId for response

---

#### 6. **Format Final Response**
- **Type:** Function/Script
- **Purpose:** Format data for React frontend
- **Output:**
```json
{
  "status": "success",
  "data": {
    "roadmapId": "...",
    "careerField": "...",
    "title": "...",
    "phasesCount": 5,
    "message": "Roadmap generated and saved successfully",
    "timestamp": "2024-11-17T10:30:00Z"
  }
}
```

---

#### 7. **Send Response**
- **Type:** Webhook Response
- **Purpose:** Return result to React frontend

---

## Frontend Integration

### React Component Flow

```
┌─────────────────────────────────────────┐
│  RoadmapGenerator Component             │
│                                         │
│  1. Display career selection dropdown   │
│  2. Get user selection                  │
│  3. Call /api/roadmaps/generate        │
│  4. Show progress bar                   │
│  5. Poll for results OR wait webhook    │
│  6. Display roadmap on success          │
│  7. Allow export & sharing              │
└─────────────────────────────────────────┘
```

### Usage Example

```jsx
import RoadmapGenerator from './components/RoadmapGenerator';

function App() {
  return <RoadmapGenerator />;
}
```

### Key Functions

```javascript
// Trigger roadmap generation
const handleGenerateRoadmap = async (careerField) => {
  const response = await axios.post('/api/roadmaps/generate', {
    careerField
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fetch generated roadmap
const fetchRoadmap = async (id) => {
  const response = await axios.get(`/api/roadmaps/${id}`);
  return response.data.data;
};

// Mark roadmap as helpful
const markHelpful = async (id) => {
  await axios.post(`/api/roadmaps/${id}/mark-helpful`);
};
```

---

## Example Payloads

### Request Payload (Webhook)

```json
{
  "careerField": "Web Development",
  "userId": "507f1f77bcf86cd799439011",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### OpenAI Request

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert career coach and learning designer."
    },
    {
      "role": "user",
      "content": "Generate a comprehensive career roadmap in JSON format for: Web Development. Include 5 phases with skills, time requirements, free and paid resources, daily checklist, and capstone project. Return ONLY valid JSON."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

### OpenAI Response (Partial)

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"title\": \"Full Stack Web Development Roadmap\", \"stages\": [{...}]}"
      }
    }
  ]
}
```

### MongoDB Save Request

```json
{
  "careerField": "Web Development",
  "title": "Full Stack Web Development Roadmap",
  "description": "Complete guide...",
  "stages": [
    {
      "name": "Phase 1: Web Fundamentals",
      "skills": [
        {
          "name": "HTML5",
          "description": "...",
          "time_required": "1 week",
          "resources": {...}
        }
      ]
    }
  ],
  "resources": {...},
  "dailyChecklist": {...},
  "generatedAt": "2024-11-17T10:30:00Z"
}
```

### MongoDB Save Response

```json
{
  "success": true,
  "roadmapId": "507f1f77bcf86cd799439011",
  "title": "Full Stack Web Development Roadmap",
  "stages": 5,
  "message": "Roadmap created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "careerField": "Web Development",
    "title": "Full Stack Web Development Roadmap",
    ...
  }
}
```

### Final Response to React

```json
{
  "status": "success",
  "data": {
    "roadmapId": "507f1f77bcf86cd799439011",
    "careerField": "Web Development",
    "title": "Full Stack Web Development Roadmap",
    "phasesCount": 5,
    "message": "Roadmap generated and saved successfully",
    "timestamp": "2024-11-17T10:30:00Z"
  }
}
```

---

## Error Handling

### Backend Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: careerField, title, stages"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "No authentication token provided"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Not authorized to view this roadmap"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Roadmap not found"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error: {{message}}"
}
```

### n8n Error Handling

The workflow includes error handling at each node:

1. **OpenAI Call Fails** → Return error response with details
2. **JSON Parse Fails** → Catch parsing error, return raw content
3. **MongoDB Save Fails** → Validate response, throw error
4. **Network Timeout** → Retry mechanism (configurable)

### Retry Logic

```javascript
// Auto-retry on network errors
const maxRetries = 3;
let retries = 0;

while (retries < maxRetries) {
  try {
    // API call
    return result;
  } catch (error) {
    retries++;
    if (retries >= maxRetries) throw error;
    await new Promise(r => setTimeout(r, 2000 * retries));
  }
}
```

---

## Security Considerations

### 1. API Key Management
```env
# NEVER commit to git
OPENAI_API_KEY=sk-proj-xxxxx (stored in .env)

# Use n8n secrets for storage
Store in: Settings → Credentials → OpenAI
```

### 2. JWT Token Validation
```javascript
// Verify token on all protected routes
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

### 3. Rate Limiting
```javascript
// Prevent abuse of roadmap generation
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
});
router.post('/generate', limiter, handleGenerate);
```

### 4. Input Validation
```javascript
// Validate and sanitize career field
const careerField = req.body.careerField?.trim();
if (!careerField || careerField.length > 100) {
  return res.status(400).json({ error: 'Invalid career field' });
}
```

### 5. CORS Configuration
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 6. Data Sanitization
```javascript
// Remove sensitive fields before response
roadmap.toJSON(); // Excludes __v
delete roadmap.aiPrompt; // Remove full prompt
```

---

## Deployment Guide

### Heroku Deployment (Backend)

```bash
# Create Heroku app
heroku create skillsync-api

# Set environment variables
heroku config:set MONGODB_URI=...
heroku config:set OPENAI_API_KEY=...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
REACT_APP_API_URL=https://skillsync-api.herokuapp.com
```

### Docker Deployment

```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t skillsync-api .
docker run -p 5000:5000 -e MONGODB_URI=... skillsync-api
```

### n8n Cloud Deployment

1. Sign up at https://n8n.cloud
2. Import workflow
3. Configure webhooks with production URLs
4. Test and activate

---

## Monitoring & Analytics

### Track Generation Metrics

```javascript
// Log to analytics service
analytics.track('roadmap_generated', {
  careerField: careerField,
  userId: userId,
  timestamp: new Date(),
  duration: endTime - startTime
});
```

### Monitor API Performance

```javascript
// Track response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

## Troubleshooting

### Issue: "Permission denied" for OpenAI API

**Solution:**
- Verify API key is valid
- Check API key has GPT-4 access
- Ensure n8n credentials are properly configured

### Issue: Roadmap not saving to MongoDB

**Solution:**
- Check MongoDB connection string
- Verify user authentication
- Check database permissions
- Review n8n logs for HTTP request errors

### Issue: Webhook not triggering

**Solution:**
- Verify webhook URL is correct
- Check firewall/network settings
- Ensure n8n workflow is active
- Test with curl/Postman

### Issue: Frontend not receiving response

**Solution:**
- Check CORS settings
- Verify JWT token is valid
- Check network tab for errors
- Review backend logs

---

## Summary

This complete system provides a production-ready solution for AI-powered career roadmap generation. It combines:

- **AI Intelligence**: GPT-4 for personalized content
- **Automation**: n8n for workflow orchestration
- **Scalability**: MongoDB for flexible data storage
- **Security**: JWT auth, rate limiting, input validation
- **UX**: React component with progress tracking
- **Analytics**: View counts, helpfulness ratings

The modular architecture allows easy extension with additional features like:
- Real-time notifications
- Community sharing
- Progress tracking integration
- Certification generation
- Mentor matching

For questions or issues, refer to the documentation or check GitHub issues.
