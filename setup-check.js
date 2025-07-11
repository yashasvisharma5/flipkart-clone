#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 RunwayML Video Generator - Setup Verification\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'backend/server.js',
  'backend/.env.example',
  'frontend/package.json',
  'frontend/src/App.tsx',
  'frontend/src/App.css',
  'frontend/.env'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

// Check node_modules directories
console.log('\n📦 Checking dependencies...');
const nodeModulesDirs = [
  'node_modules',
  'backend/node_modules',
  'frontend/node_modules'
];

nodeModulesDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - Run 'npm install' in the appropriate directory`);
    allFilesExist = false;
  }
});

// Check environment files
console.log('\n🔧 Checking environment configuration...');

// Backend .env
if (fs.existsSync('backend/.env')) {
  const backendEnv = fs.readFileSync('backend/.env', 'utf8');
  if (backendEnv.includes('RUNWAY_API_KEY=your_runway_api_key_here')) {
    console.log('⚠️  Backend .env exists but needs configuration');
  } else {
    console.log('✅ Backend .env appears to be configured');
  }
} else {
  console.log('❌ Backend .env missing - copy from .env.example and configure');
}

// Frontend .env
if (fs.existsSync('frontend/.env')) {
  console.log('✅ Frontend .env exists');
} else {
  console.log('❌ Frontend .env missing');
}

console.log('\n🚀 Next steps:');
console.log('1. Configure your backend/.env file with API keys');
console.log('2. Run "npm run dev" to start both frontend and backend');
console.log('3. Open http://localhost:3000 in your browser');

if (allFilesExist) {
  console.log('\n🎉 Setup verification completed successfully!');
  process.exit(0);
} else {
  console.log('\n❌ Setup verification failed. Please fix the missing files/directories.');
  process.exit(1);
}