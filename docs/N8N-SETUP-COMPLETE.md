# Complete n8n + OpenAI Integration Setup Guide

This guide provides complete instructions for setting up the n8n workflow integration with your SkillSync project.

## 📋 Prerequisites

1. **n8n Account** (cloud or self-hosted)
   - Sign up at [n8n.cloud](https://n8n.cloud) OR
   - Self-host n8n locally
   
2. **OpenAI API Key**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - You'll need credits on your OpenAI account

3. **SkillSync Backend Running**
   - Backend should be accessible (localhost:5000 or your deployed URL)

## 🔧 Step 1: Import the n8n Workflow

1. **Open n8n Dashboard**
   - Go to your n8n instance (cloud or local)

2. **Import Workflow**
   - Click "Workflows" → "Import from File"
   - Select `n8n-workflows/skillsync-roadmap-automation.json`
   - OR manually create using the steps below

3. **Activate Workflow**
   - Click the "Active" toggle at the top right
   - The workflow is now live and ready to receive webhooks

## 🎯 Step 2: Configure n8n Workflow

### Node 1: Webhook Trigger

- **HTTP Method**: `POST`
- **Path**: `roadmap-generator`
- **Response Mode**: `Last Node`
- **Webhook URL**: 
  - Cloud: `https://api.n8n.cloud/webhook/roadmap-generator`
  - Local: `http://localhost:5678/webhook/roadmap-generator`

### Node 2: Code Node (Prompt Builder)

This node builds the prompt for OpenAI. The code is already included in the workflow JSON.

### Node 3: OpenAI Node

1. **Add OpenAI Credentials**
   - Click on the OpenAI node
   - Click "Create New Credential"
   - Select "OpenAI API"
   - Enter your OpenAI API Key
   - Save

2. **Configure Node**
   - Resource: `Text`
   - Operation: `Message`
   - Model: `gpt-4o-mini`
   - Prompt: `={{ $json.formattedPrompt }}`
   - Max Tokens: `3000`
   - Temperature: `0.7`

### Node 4: Code Node (Parser)

This node parses the OpenAI response. Code is already included.

### Node 5: Respond to Webhook

This node returns the formatted response. Configuration is already set.

## ⚙️ Step 3: Configure Backend Environment

1. **Copy Environment File**
   ```bash
   cp backend/env.example backend/.env
   ```

2. **Update `.env` File**
   ```env
   # n8n Webhook URL
   # For n8n.cloud:
   N8N_ROADMAP_WEBHOOK_URL=https://api.n8n.cloud/webhook/roadmap-generator
   
   # For local n8n:
   # N8N_ROADMAP_WEBHOOK_URL=http://localhost:5678/webhook/roadmap-generator
   
   # Webhook Secret (optional, for security)
   N8N_WEBHOOK_SECRET=my-secret-key
   
   # Backend URL (for callbacks if needed)
   BACKEND_URL=http://localhost:5000
   ```

3. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

## 🖥️ Step 4: Configure Frontend

The frontend is already configured! Just ensure:

1. **API URL is correct**
   - Check `src/pages/RoadmapGenerator.jsx`
   - Update if your backend runs on different port:
   ```javascript
   const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

## 🧪 Step 5: Test the Integration

### Test n8n Workflow Directly

1. **Get Webhook URL**
   - From n8n dashboard, click on the webhook node
   - Copy the webhook URL

2. **Test with cURL**
   ```bash
   curl -X POST https://api.n8n.cloud/webhook/roadmap-generator \
     -H "Content-Type: application/json" \
     -d '{
       "careerField": "Web Development",
       "currentLevel": "Beginner",
       "targetLevel": "Advanced",
       "timeCommitment": "10-20",
       "learningStyle": "hands-on",
       "specificGoals": "Learn React and build modern web applications",
       "preferredResources": ["FreeCodeCamp", "YouTube"]
     }'
   ```

### Test from Frontend

1. **Navigate to Roadmap Generator**
   - Go to `http://localhost:3000/roadmap/generate`
   - Login if required

2. **Fill the Form**
   - Select a career field
   - Choose current and target levels
   - Set time commitment
   - Add specific goals
   - Select preferred resources

3. **Generate Roadmap**
   - Click "Generate AI Roadmap"
   - Wait 30-60 seconds for generation
   - Roadmap should appear and redirect to view page

## 📊 Expected Response Format

The n8n workflow returns:

```json
{
  "success": true,
  "data": {
    "roadmap_json": {
      "title": "Frontend Developer Roadmap",
      "overview": {
        "description": "...",
        "duration": "6 months",
        "difficulty": 3,
        "outcomes": [...]
      },
      "phases": [
        {
          "id": "phase-1",
          "title": "Basics of Web",
          "description": "...",
          "duration": "2 Weeks",
          "order": 1,
          "color": "#3B82F6",
          "steps": [...]
        }
      ],
      "connections": [...],
      "metadata": {...}
    },
    "roadmap_doc": "Step-by-step journey to become..."
  }
}
```

## 🔍 Troubleshooting

### Issue: n8n webhook returns error

**Solution:**
- Check that workflow is activated in n8n
- Verify webhook URL in backend `.env` matches n8n webhook URL
- Check n8n execution logs for errors

### Issue: OpenAI API error

**Solution:**
- Verify OpenAI API key is correct in n8n credentials
- Check you have credits on your OpenAI account
- Ensure model name is correct (`gpt-4o-mini`)

### Issue: Backend can't reach n8n

**Solution:**
- If using local n8n, ensure it's running on port 5678
- Check firewall settings
- Verify `N8N_ROADMAP_WEBHOOK_URL` in backend `.env`

### Issue: Frontend shows timeout

**Solution:**
- Increase timeout in backend axios call (currently 60 seconds)
- Check browser console for errors
- Verify backend is running and accessible

### Issue: Invalid JSON response from n8n

**Solution:**
- Check parser node in n8n workflow
- Verify OpenAI is returning valid JSON
- Review n8n execution logs for parsing errors

## 📝 Notes

1. **OpenAI API Key**: Never commit your API key to version control. Add it only in n8n credentials.

2. **Webhook Security**: Consider adding webhook secret authentication:
   - In n8n: Add authentication to webhook node
   - In backend: Send `x-webhook-secret` header

3. **Rate Limiting**: OpenAI API has rate limits. Consider:
   - Adding retry logic
   - Implementing request queuing
   - Using exponential backoff

4. **Cost Optimization**: `gpt-4o-mini` is cost-effective. For better quality, use `gpt-4` but it's more expensive.

## ✅ Complete Setup Checklist

- [ ] n8n workflow imported and activated
- [ ] OpenAI credentials configured in n8n
- [ ] Backend `.env` configured with n8n webhook URL
- [ ] Backend server running
- [ ] Frontend can access backend API
- [ ] Test request successful
- [ ] Roadmap generation working end-to-end

## 🚀 Next Steps

1. **Customize the prompt** in the Code Node (Prompt Builder) for better results
2. **Add error handling** for better user experience
3. **Implement caching** to avoid regenerating similar roadmaps
4. **Add progress tracking** for long-running generations
5. **Monitor usage** and optimize costs

---

**Need Help?** Check the n8n execution logs and backend console for detailed error messages.

