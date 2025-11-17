# Quick Implementation Guide

## 🚀 5-Minute Setup

### Step 1: Copy Environment Template

```bash
cd backend
cp env.example .env
```

### Step 2: Update .env with Your Keys

```env
# Backend
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://your-user:your-pass@cluster.mongodb.net/skillsync

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=sk-proj-your-actual-key-here

# n8n Webhook
N8N_ROADMAP_WEBHOOK_URL=http://localhost:5678/webhook/your-unique-id

# Frontend
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Step 3: Install & Run Backend

```bash
cd backend
npm install
npm start
# Server running on http://localhost:5000
```

### Step 4: Setup Frontend

```bash
# In root directory
npm install
# Create .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm start
# App running on http://localhost:3000
```

### Step 5: Setup n8n Workflow

```bash
# Download n8n
npm install -g n8n

# Start n8n
n8n start
# Open http://localhost:5678
```

**In n8n:**
1. Create OpenAI credentials
2. Import workflow: `n8n-workflows/skillsync-ai-roadmap-generation.json`
3. Update webhook URL to match your n8n instance
4. Activate workflow

---

## 📝 Testing the System

### Test 1: Generate Roadmap via API

```bash
# Get JWT token first (login)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in request
curl -X POST http://localhost:5000/api/roadmaps/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"careerField":"Web Development"}'
```

### Test 2: Fetch Generated Roadmap

```bash
curl -X GET http://localhost:5000/api/roadmaps?field=Web%20Development \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 3: Test n8n Webhook

```bash
curl -X POST http://localhost:5678/webhook/your-unique-id \
  -H "Content-Type: application/json" \
  -d '{
    "careerField": "Data Science",
    "userId": "test-user-id",
    "token": "test-jwt-token"
  }'
```

---

## 🎨 Frontend Usage

### 1. Import Component

```jsx
// App.jsx
import RoadmapGenerator from './components/RoadmapGenerator-Advanced';

function App() {
  return (
    <div className="app">
      <RoadmapGenerator />
    </div>
  );
}

export default App;
```

### 2. Add to Navigation

```jsx
// Navbar.jsx
<nav>
  <Link to="/roadmaps">Career Roadmaps</Link>
  <Link to="/my-roadmaps">My Roadmaps</Link>
</nav>
```

### 3. Style Component

Create `src/components/RoadmapGenerator.css`:

```css
.roadmap-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.generator-header {
  text-align: center;
  margin-bottom: 3rem;
}

.generator-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.career-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 250px;
}

.career-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.generate-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.roadmap-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.phase-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #667eea;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.skill-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
```

---

## 🔌 MongoDB Schema Reference

```javascript
// Connection string format
mongodb+srv://username:password@cluster.mongodb.net/skillsync

// Collections created:
// 1. roadmaps - stores all generated roadmaps
// 2. users - user profiles
// 3. progress - user progress tracking

// Roadmap document structure
{
  _id: ObjectId,
  userId: ObjectId,
  careerField: "Web Development",
  title: "Full Stack Web Development Roadmap",
  description: "...",
  stages: [...],
  resources: {...},
  dailyChecklist: {...},
  views: 42,
  helpful: 15,
  createdAt: ISODate,
  updatedAt: ISODate,
  status: "published"
}
```

---

## 📚 Resource Files

### Template Career Roadmaps

Located in `roadmap-templates/`:

- `full-stack-web-development.json` - Complete roadmap example
- `data-science.json` - Data science path
- `mobile-development.json` - Mobile development

### Example API Responses

Located in `examples/`:

- `sample-roadmap.json` - Example roadmap structure
- `api-request-response.json` - Full flow example

---

## 🛠️ Customization

### Add New Career Field

1. Update career options in React component:

```jsx
const careerOptions = [
  'Web Development',
  'Your New Field', // Add here
];
```

2. Test workflow with new field
3. Monitor generation quality
4. Adjust OpenAI prompt if needed

### Customize Roadmap Prompt

Edit in n8n workflow > OpenAI node:

```javascript
// Current prompt
"Generate a comprehensive career roadmap in JSON format for: {{ field }}. Include phases, skills, resources, and time estimates. Return ONLY valid JSON."

// Customize for specific needs
"Generate a [DURATION]-month career roadmap for [FIELD] focusing on [FOCUS_AREA]. Include [CUSTOM_REQUIREMENTS]. Return as JSON with structure..."
```

### Extend Roadmap Fields

In `backend/models/Roadmap-Advanced.js`:

```javascript
// Add new field
certifications: [{
  title: String,
  provider: String,
  link: String
}],

// Add new method
RoadmapSchema.statics.getByCertification = function(cert) {
  return this.find({ 'certifications.title': cert });
};
```

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid OpenAI API Key"

**Solution:**
```bash
# Verify key format
echo $OPENAI_API_KEY

# Should start with: sk-proj-
# Not: sk- or empty

# Update in n8n:
1. Settings > Credentials
2. Edit OpenAI credential
3. Paste new key
4. Save
```

### Issue: "CORS Error"

**Solution:**
```javascript
// In backend/server.js
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### Issue: "MongoDB Connection Failed"

**Solution:**
```bash
# Check connection string format
# mongodb+srv://user:password@cluster.mongodb.net/dbname

# Verify credentials:
# 1. Login to MongoDB Atlas
# 2. Database > Connect > Node.js
# 3. Copy connection string
# 4. Replace <password> with actual password
# 5. Add to .env

# Test connection:
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Issue: "n8n Webhook Not Found"

**Solution:**
```bash
# Check webhook is active:
1. n8n dashboard > Workflows
2. Click workflow
3. Ensure "Active" toggle is ON
4. Copy webhook URL from workflow details
5. Test with curl:

curl -X POST http://localhost:5678/webhook/... \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📊 Performance Tips

### 1. Cache Roadmaps

```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

app.get('/api/roadmaps/:id', async (req, res) => {
  const cached = await client.get(`roadmap:${req.params.id}`);
  if (cached) return res.json(JSON.parse(cached));
  
  const roadmap = await Roadmap.findById(req.params.id);
  await client.setex(`roadmap:${req.params.id}`, 3600, JSON.stringify(roadmap));
  res.json(roadmap);
});
```

### 2. Optimize Database Queries

```javascript
// Add indexes
RoadmapSchema.index({ userId: 1, createdAt: -1 });
RoadmapSchema.index({ careerField: 1 });

// Use lean() for read-only queries
const roadmaps = await Roadmap.find().lean();
```

### 3. Pagination

```javascript
// Default limit
const limit = Math.min(req.query.limit || 10, 100);
const skip = (req.query.page - 1) * limit;

const roadmaps = await Roadmap.find()
  .limit(limit)
  .skip(skip);
```

---

## 🎓 Learning Path

After implementing this system, learn:

1. **Advanced React**: State management, hooks, performance
2. **Backend Scaling**: Load balancing, caching, optimization
3. **AI Integration**: Fine-tuning, embeddings, RAG
4. **DevOps**: Docker, Kubernetes, CI/CD
5. **Analytics**: User tracking, metrics, dashboards

---

## 📞 Support

For issues:

1. Check `ROADMAP-GENERATION-SYSTEM.md` documentation
2. Review error logs: `backend/logs/error.log`
3. Test endpoints with Postman
4. Check n8n workflow execution logs
5. Review MongoDB Atlas performance metrics

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created
- [ ] OpenAI API key obtained
- [ ] n8n workflow tested and active
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Error handling tested
- [ ] Frontend environment updated
- [ ] Secrets not committed to git
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

Ready to deploy! 🚀
