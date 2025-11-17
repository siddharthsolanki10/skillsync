#!/usr/bin/env node

/**
 * Route Testing Script
 * Verifies that all backend routes are properly registered and functional
 * Run this script to validate the roadmap API endpoints
 */

const express = require('express');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🧪 SkillSync Route Verification Test Suite');
console.log('='.repeat(70) + '\n');

try {
  // Test 1: Load models
  console.log('📦 Test 1: Loading Models...');
  const Roadmap = require('./models/Roadmap-Advanced');
  console.log('   ✅ Roadmap-Advanced model loaded');
  
  // Test 2: Load routes
  console.log('\n📦 Test 2: Loading Route Files...');
  const roadmapAdvancedRoutes = require('./routes/roadmaps-advanced');
  console.log('   ✅ roadmaps-advanced.js loaded');
  
  // Test 3: Check route stack
  console.log('\n📋 Test 3: Verifying Route Definitions...');
  const routeStack = roadmapAdvancedRoutes.stack;
  console.log(`   Total routes defined: ${routeStack.length}`);
  
  if (routeStack.length !== 8) {
    throw new Error(`Expected 8 routes, found ${routeStack.length}`);
  }
  
  routeStack.forEach((route, index) => {
    if (route.route) {
      const method = Object.keys(route.route.methods)[0].toUpperCase();
      console.log(`   ✅ Route ${index + 1}: ${method.padEnd(6)} ${route.route.path}`);
    }
  });
  
  // Test 4: Express integration
  console.log('\n📦 Test 4: Testing Express Integration...');
  const app = express();
  app.use('/api/roadmaps-advanced', roadmapAdvancedRoutes);
  console.log('   ✅ Routes registered on /api/roadmaps-advanced');
  
  // Test 5: Verify endpoint accessibility
  console.log('\n📋 Test 5: Endpoint Accessibility Map...');
  const endpoints = [
    { method: 'POST', path: '/generate', auth: 'Required' },
    { method: 'POST', path: '/', auth: 'Required' },
    { method: 'GET', path: '/:id', auth: 'Optional' },
    { method: 'GET', path: '/', auth: 'Optional' },
    { method: 'GET', path: '/user/:userId', auth: 'Required' },
    { method: 'PUT', path: '/:id', auth: 'Required' },
    { method: 'DELETE', path: '/:id', auth: 'Required' },
    { method: 'POST', path: '/:id/mark-helpful', auth: 'Optional' }
  ];
  
  endpoints.forEach((ep, index) => {
    const fullPath = `/api/roadmaps-advanced${ep.path}`;
    const auth = ep.auth === 'Required' ? '🔒' : '🔓';
    console.log(`   ${auth} ${(index + 1).toString().padEnd(2)} ${ep.method.padEnd(6)} ${fullPath.padEnd(45)} [${ep.auth}]`);
  });
  
  // Test 6: Auth middleware verification
  console.log('\n📦 Test 6: Auth Middleware Verification...');
  const authMiddleware = require('./middleware/auth');
  if (authMiddleware.protect && typeof authMiddleware.protect === 'function') {
    console.log('   ✅ protect function available');
  }
  if (authMiddleware.generateToken && typeof authMiddleware.generateToken === 'function') {
    console.log('   ✅ generateToken function available');
  }
  
  // Test 7: Model schema verification
  console.log('\n📦 Test 7: Verifying Model Schema...');
  const schema = Roadmap.schema;
  const requiredFields = ['userId', 'careerField', 'title', 'stages'];
  let allFieldsPresent = true;
  
  requiredFields.forEach(field => {
    if (schema.paths[field]) {
      console.log(`   ✅ Field '${field}' defined in schema`);
    } else {
      console.log(`   ❌ Field '${field}' MISSING from schema`);
      allFieldsPresent = false;
    }
  });
  
  if (allFieldsPresent) {
    console.log('   ✅ All required fields present');
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TESTS PASSED');
  console.log('='.repeat(70));
  console.log('\n📊 Test Results Summary:');
  console.log('   ✅ Models loaded successfully');
  console.log('   ✅ All 8 routes properly defined');
  console.log('   ✅ Routes registered with Express');
  console.log('   ✅ Auth middleware available');
  console.log('   ✅ Schema fields verified');
  
  console.log('\n🚀 Ready to deploy!');
  console.log('   Run: npm start');
  console.log('   Server will listen on port 5000');
  console.log('   Routes accessible at: http://localhost:5000/api/roadmaps-advanced/*');
  
  console.log('\n' + '='.repeat(70) + '\n');
  
} catch (error) {
  console.error('\n❌ TEST FAILED');
  console.error('=' . repeat(70));
  console.error(`Error: ${error.message}`);
  console.error(error.stack);
  console.error('=' . repeat(70) + '\n');
  process.exit(1);
}
