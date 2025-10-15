# n8n Automation Workflow Setup Guide

This guide provides step-by-step instructions for setting up n8n automation workflows to integrate AI-powered roadmap generation with SkillSync.

## Overview

The n8n workflow automates the process of:
1. Receiving roadmap generation requests from SkillSync
2. Processing user requirements with OpenAI GPT
3. Generating structured roadmap JSON and documentation
4. Storing results and notifying SkillSync via webhooks

## Prerequisites

- n8n instance (cloud or self-hosted)
- OpenAI API key
- SkillSync backend accessible from n8n
- MongoDB connection (if using direct database operations)

## Workflow Architecture

```
SkillSync Request → n8n Webhook → OpenAI Processing → Data Formatting → Database Storage → Callback Webhook
```

## Step 1: Create the Main Workflow

### 1.1 Setup Webhook Trigger

1. **Add Webhook Node**
   - Node Type: `Webhook`
   - HTTP Method: `POST`
   - Path: `/skillsync-roadmap-generation`
   - Authentication: `Header Auth` (optional, recommended)

2. **Configure Webhook Settings**
   ```json
   {
     "httpMethod": "POST",
     "path": "skillsync-roadmap-generation",
     "responseMode": "responseNode",
     "options": {}
   }
   ```

3. **Expected Request Body**
   ```json
   {
     "roadmapId": "string",
     "userId": "string", 
     "careerField": "string",
     "currentLevel": "beginner|intermediate|advanced|expert",
     "targetLevel": "beginner|intermediate|advanced|expert",
     "timeCommitment": "string",
     "learningStyle": "visual|hands-on|reading|interactive",
     "specificGoals": "string",
     "preferredResources": ["array", "of", "strings"],
     "callbackUrl": "string"
   }
   ```

### 1.2 Data Validation and Preprocessing

1. **Add Code Node - Input Validation**
   ```javascript
   // Validate required fields
   const requiredFields = ['roadmapId', 'userId', 'careerField', 'currentLevel', 'targetLevel', 'timeCommitment', 'specificGoals'];
   const missingFields = requiredFields.filter(field => !$input.first().json[field]);
   
   if (missingFields.length > 0) {
     throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
   }
   
   // Format data for OpenAI
   const userData = $input.first().json;
   const prompt = `Create a comprehensive learning roadmap for:
   
   Career Field: ${userData.careerField}
   Current Level: ${userData.currentLevel}
   Target Level: ${userData.targetLevel}
   Time Commitment: ${userData.timeCommitment} hours per week
   Learning Style: ${userData.learningStyle}
   Specific Goals: ${userData.specificGoals}
   Preferred Resources: ${userData.preferredResources.join(', ')}
   
   Generate a detailed roadmap with phases, steps, resources, and timeline.
   Return the response in the exact JSON schema format specified.`;
   
   return [{
     json: {
       ...userData,
       formattedPrompt: prompt,
       timestamp: new Date().toISOString()
     }
   }];
   ```

## Step 2: OpenAI Integration

### 2.1 Configure OpenAI Node

1. **Add OpenAI Node**
   - Node Type: `OpenAI`
   - Operation: `Text`
   - Model: `gpt-4` or `gpt-3.5-turbo`

2. **OpenAI Configuration**
   ```json
   {
     "operation": "text",
     "model": "gpt-4",
     "prompt": "={{ $json.formattedPrompt }}",
     "maxTokens": 4000,
     "temperature": 0.7,
     "options": {
       "response_format": { "type": "json_object" }
     }
   }
   ```

3. **System Prompt (in additional properties)**
   ```
   You are an expert learning path designer. Create comprehensive, personalized learning roadmaps that follow this exact JSON schema:

   {
     "title": "string",
     "description": "string", 
     "careerField": "string",
     "estimatedDuration": "string",
     "difficulty": "string",
     "phases": [
       {
         "id": "string",
         "title": "string",
         "description": "string",
         "order": number,
         "duration": "string",
         "color": "#hexcolor",
         "prerequisites": ["array"],
         "learningObjectives": ["array"],
         "steps": [
           {
             "id": "string",
             "title": "string", 
             "description": "string",
             "type": "lesson|project|assessment|reading",
             "duration": "string",
             "difficulty": 1-5,
             "order": number,
             "skills": ["array"],
             "resources": [
               {
                 "title": "string",
                 "type": "video|article|course|book|tool",
                 "url": "string",
                 "description": "string",
                 "difficulty": 1-5,
                 "estimatedTime": "string",
                 "cost": "free|paid",
                 "rating": 1-5
               }
             ],
             "projects": [
               {
                 "title": "string",
                 "description": "string", 
                 "difficulty": 1-5,
                 "estimatedTime": "string",
                 "skills": ["array"],
                 "deliverables": ["array"]
               }
             ],
             "milestones": [
               {
                 "title": "string",
                 "description": "string",
                 "criteria": ["array"]
               }
             ]
           }
         ]
       }
     ],
     "metadata": {
       "totalSteps": number,
       "totalProjects": number, 
       "skillsCount": number,
       "resourcesCount": number
     }
   }

   Ensure all IDs are unique, phases are logically ordered, and content is detailed and actionable.
   ```

### 2.2 Parse and Validate OpenAI Response

1. **Add Code Node - Response Processing**
   ```javascript
   try {
     const aiResponse = $input.first().json.message.content;
     let roadmapData;
     
     try {
       roadmapData = JSON.parse(aiResponse);
     } catch (parseError) {
       // Try to extract JSON from markdown code blocks
       const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
       if (jsonMatch) {
         roadmapData = JSON.parse(jsonMatch[1]);
       } else {
         throw new Error('Invalid JSON format from OpenAI');
       }
     }
     
     // Validate required schema fields
     const requiredFields = ['title', 'phases', 'careerField'];
     const missing = requiredFields.filter(field => !roadmapData[field]);
     
     if (missing.length > 0) {
       throw new Error(`Missing required roadmap fields: ${missing.join(', ')}`);
     }
     
     // Add metadata
     roadmapData.aiMetadata = {
       model: 'gpt-4',
       generatedAt: new Date().toISOString(),
       confidence: 95,
       processingTime: Date.now() - new Date($json.timestamp).getTime()
     };
     
     // Calculate totals
     const totalSteps = roadmapData.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
     const totalProjects = roadmapData.phases.reduce((sum, phase) => 
       sum + phase.steps.reduce((stepSum, step) => stepSum + (step.projects?.length || 0), 0), 0
     );
     
     roadmapData.metadata = {
       ...roadmapData.metadata,
       totalSteps,
       totalProjects,
       generatedBy: 'n8n-openai-workflow'
     };
     
     return [{
       json: {
         originalRequest: $('Webhook').first().json,
         roadmapData,
         success: true
       }
     }];
     
   } catch (error) {
     return [{
       json: {
         originalRequest: $('Webhook').first().json,
         error: error.message,
         success: false
       }
     }];
   }
   ```

## Step 3: Documentation Generation

### 3.1 Generate Learning Documentation

1. **Add OpenAI Node - Documentation**
   - Condition: Only if roadmap generation succeeded
   - Model: `gpt-4`
   - Operation: `Text`

2. **Documentation Prompt**
   ```javascript
   // In Code node before OpenAI
   const roadmap = $json.roadmapData;
   const docPrompt = `Create comprehensive learning documentation for this roadmap:

   Title: ${roadmap.title}
   Career Field: ${roadmap.careerField}
   Target: ${roadmap.description}

   Based on the roadmap phases and steps, create:

   1. **Executive Summary** - Overview of the learning journey
   2. **Prerequisites** - What learners should know before starting
   3. **Learning Methodology** - How to approach this roadmap effectively
   4. **Phase-by-Phase Guide** - Detailed walkthrough of each phase
   5. **Resource Recommendations** - Best practices for using provided resources
   6. **Project Guidelines** - How to approach and complete projects
   7. **Assessment Criteria** - How to measure progress and success
   8. **Career Outcomes** - What opportunities this roadmap opens
   9. **Next Steps** - What to do after completing this roadmap
   10. **Community & Support** - Where to find help and connect with others

   Format as clean HTML with proper headings, lists, and structure.
   Make it comprehensive, engaging, and actionable.
   
   Roadmap JSON: ${JSON.stringify(roadmap, null, 2)}`;

   return [{ json: { ...data, docPrompt } }];
   ```

### 3.2 Process Documentation Response

1. **Add Code Node - Documentation Processing**
   ```javascript
   const documentationContent = $input.first().json.message.content;
   
   // Clean up the content
   const cleanContent = documentationContent
     .replace(/```html\n?/g, '')
     .replace(/\n?```/g, '')
     .trim();
   
   return [{
     json: {
       ...data,
       documentation: {
         title: `${$json.roadmapData.title} - Learning Guide`,
         content: cleanContent,
         type: 'roadmap-guide',
         createdAt: new Date().toISOString()
       }
     }
   }];
   ```

## Step 4: Database Operations

### 4.1 Store Roadmap Data

1. **Add HTTP Request Node - Save Roadmap**
   ```json
   {
     "method": "POST",
     "url": "{{ $env.SKILLSYNC_API_URL }}/api/roadmaps/{{ $json.originalRequest.roadmapId }}/complete",
     "headers": {
       "Content-Type": "application/json",
       "Authorization": "Bearer {{ $env.SKILLSYNC_API_KEY }}"
     },
     "body": {
       "roadmapData": "{{ $json.roadmapData }}",
       "documentation": "{{ $json.documentation }}",
       "metadata": {
         "generatedBy": "n8n",
         "workflowId": "{{ $execution.id }}",
         "completedAt": "{{ new Date().toISOString() }}"
       }
     }
   }
   ```

### 4.2 Update Generation Status

1. **Add HTTP Request Node - Status Update**
   ```json
   {
     "method": "PATCH", 
     "url": "{{ $env.SKILLSYNC_API_URL }}/api/roadmaps/{{ $json.originalRequest.roadmapId }}/status",
     "headers": {
       "Content-Type": "application/json",
       "Authorization": "Bearer {{ $env.SKILLSYNC_API_KEY }}"
     },
     "body": {
       "status": "completed",
       "completedAt": "{{ new Date().toISOString() }}",
       "metadata": {
         "totalProcessingTime": "{{ Date.now() - new Date($json.originalRequest.timestamp).getTime() }}ms"
       }
     }
   }
   ```

## Step 5: Callback and Error Handling

### 5.1 Success Callback

1. **Add HTTP Request Node - Success Webhook**
   ```json
   {
     "method": "POST",
     "url": "{{ $json.originalRequest.callbackUrl }}",
     "headers": {
       "Content-Type": "application/json"
     },
     "body": {
       "roadmapId": "{{ $json.originalRequest.roadmapId }}",
       "status": "completed",
       "message": "Roadmap generated successfully",
       "metadata": {
         "phasesCount": "{{ $json.roadmapData.phases.length }}",
         "stepsCount": "{{ $json.roadmapData.metadata.totalSteps }}",
         "processingTime": "{{ $json.roadmapData.aiMetadata.processingTime }}ms"
       }
     }
   }
   ```

### 5.2 Error Handling Workflow

1. **Add Error Trigger Node**
   - Configure to catch workflow errors

2. **Add Code Node - Error Processing**
   ```javascript
   const error = $input.first().json;
   const originalRequest = $('Webhook').first().json;
   
   return [{
     json: {
       roadmapId: originalRequest.roadmapId,
       status: 'failed',
       error: {
         message: error.message || 'Unknown error occurred',
         timestamp: new Date().toISOString(),
         workflowId: $execution.id
       }
     }
   }];
   ```

3. **Add HTTP Request Node - Error Callback**
   ```json
   {
     "method": "POST",
     "url": "{{ $json.originalRequest.callbackUrl }}",
     "headers": {
       "Content-Type": "application/json"
     },
     "body": {
       "roadmapId": "{{ $json.roadmapId }}",
       "status": "failed", 
       "error": "{{ $json.error.message }}",
       "timestamp": "{{ $json.error.timestamp }}"
     }
   }
   ```

## Step 6: Environment Configuration

### 6.1 Required Environment Variables

Set these in your n8n environment:

```bash
# SkillSync Integration
SKILLSYNC_API_URL=https://your-skillsync-domain.com
SKILLSYNC_API_KEY=your_api_key_here

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key

# Database (if direct access needed)
MONGODB_URI=mongodb://your-connection-string

# Security
WEBHOOK_AUTH_TOKEN=your_webhook_auth_token
```

### 6.2 Webhook URL Configuration

Your webhook URL will be:
```
https://your-n8n-instance.com/webhook/skillsync-roadmap-generation
```

Update SkillSync backend configuration:
```javascript
// In backend config
const N8N_CONFIG = {
  webhookUrl: 'https://your-n8n-instance.com/webhook/skillsync-roadmap-generation',
  authToken: process.env.N8N_WEBHOOK_AUTH_TOKEN
};
```

## Step 7: Testing and Deployment

### 7.1 Test the Workflow

1. **Manual Test**
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/skillsync-roadmap-generation \
     -H "Content-Type: application/json" \
     -d '{
       "roadmapId": "test-123",
       "userId": "user-456", 
       "careerField": "web-development",
       "currentLevel": "beginner",
       "targetLevel": "intermediate",
       "timeCommitment": "5-10",
       "learningStyle": "hands-on",
       "specificGoals": "Learn React and build full-stack applications",
       "preferredResources": ["Free Online Courses", "Practice Projects"],
       "callbackUrl": "https://your-skillsync.com/api/webhooks/n8n-callback"
     }'
   ```

2. **Integration Test from SkillSync**
   - Create a roadmap generation request through SkillSync UI
   - Monitor n8n execution logs
   - Verify data storage in SkillSync database
   - Check callback webhook delivery

### 7.2 Production Deployment

1. **Workflow Settings**
   - Enable error workflows
   - Set appropriate timeouts (recommend 5-10 minutes)
   - Configure retry logic for failed HTTP requests
   - Enable execution logging

2. **Monitoring Setup**
   - Set up n8n execution monitoring
   - Configure alerts for failed executions
   - Monitor OpenAI API usage and costs
   - Track webhook delivery success rates

3. **Scaling Considerations**
   - Consider n8n cloud for auto-scaling
   - Implement queue management for high-volume requests
   - Set up load balancing if using multiple n8n instances
   - Monitor and optimize OpenAI API rate limits

## Troubleshooting

### Common Issues

1. **OpenAI JSON Parsing Errors**
   - Increase temperature if responses are too rigid
   - Add retry logic with different prompts
   - Implement fallback parsing for malformed JSON

2. **Webhook Delivery Failures**
   - Verify SkillSync endpoint accessibility
   - Check authentication credentials
   - Implement webhook retry logic

3. **Timeout Issues**
   - Increase workflow timeout settings
   - Optimize OpenAI prompts for faster generation
   - Consider breaking large roadmaps into smaller chunks

4. **Rate Limiting**
   - Implement exponential backoff for OpenAI requests
   - Monitor API usage quotas
   - Consider upgrading OpenAI plan for higher limits

### Debugging

1. **Enable Debug Mode**
   ```javascript
   // Add to any Code node for debugging
   console.log('Debug data:', JSON.stringify($input.all(), null, 2));
   ```

2. **Execution Logs**
   - Check n8n execution history for failed runs
   - Review OpenAI response logs
   - Monitor HTTP request/response logs

3. **Data Validation**
   - Add validation steps after each major operation
   - Log intermediate results for troubleshooting
   - Implement data integrity checks

## Security Best Practices

1. **API Key Management**
   - Store all API keys as environment variables
   - Use n8n credential system for sensitive data
   - Regularly rotate API keys

2. **Webhook Security**
   - Implement authentication for incoming webhooks
   - Validate request signatures if supported
   - Use HTTPS for all webhook communications

3. **Data Privacy**
   - Ensure user data is handled according to privacy policies
   - Implement data retention policies
   - Consider data encryption for sensitive information

This completes the n8n workflow setup for AI-powered roadmap generation. The workflow provides a robust, scalable solution for integrating OpenAI's capabilities with SkillSync's learning platform.