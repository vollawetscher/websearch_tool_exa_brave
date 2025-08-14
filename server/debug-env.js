import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Environment Debug Information:');
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Node.js version:', process.version);

// Check for .env files in different locations
const possibleEnvPaths = [
  '.env',
  '../.env',
  join(process.cwd(), '.env'),
  join(__dirname, '.env'),
  join(__dirname, '../.env')
];

console.log('\n📁 Checking for .env files:');
possibleEnvPaths.forEach(path => {
  const exists = existsSync(path);
  console.log(`${exists ? '✅' : '❌'} ${path} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  
  if (exists) {
    try {
      const content = readFileSync(path, 'utf8');
      console.log(`   Content preview: ${content.substring(0, 100)}...`);
      console.log(`   Lines: ${content.split('\n').length}`);
      console.log(`   Contains BRAVE_API_KEY: ${content.includes('BRAVE_API_KEY')}`);
      console.log(`   Contains EXA_API_KEY: ${content.includes('EXA_API_KEY')}`);
    } catch (error) {
      console.log(`   Error reading file: ${error.message}`);
    }
  }
});

// Try loading dotenv from different paths
console.log('\n🔧 Testing dotenv loading:');
const envResults = [];

// Test default loading
try {
  const result1 = dotenv.config();
  envResults.push({ method: 'default', result: result1 });
  console.log('Default dotenv.config():', result1.error ? `ERROR: ${result1.error}` : 'SUCCESS');
} catch (error) {
  console.log('Default dotenv.config() ERROR:', error.message);
}

// Test with explicit path
try {
  const result2 = dotenv.config({ path: '.env' });
  envResults.push({ method: 'explicit .env', result: result2 });
  console.log('Explicit .env path:', result2.error ? `ERROR: ${result2.error}` : 'SUCCESS');
} catch (error) {
  console.log('Explicit .env path ERROR:', error.message);
}

// Test with parent directory
try {
  const result3 = dotenv.config({ path: '../.env' });
  envResults.push({ method: 'parent dir', result: result3 });
  console.log('Parent directory .env:', result3.error ? `ERROR: ${result3.error}` : 'SUCCESS');
} catch (error) {
  console.log('Parent directory .env ERROR:', error.message);
}

console.log('\n🔑 Environment Variables After Loading:');
console.log('BRAVE_API_KEY:', process.env.BRAVE_API_KEY ? `SET (${process.env.BRAVE_API_KEY.substring(0, 10)}...)` : 'NOT SET');
console.log('EXA_API_KEY:', process.env.EXA_API_KEY ? `SET (${process.env.EXA_API_KEY.substring(0, 10)}...)` : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

console.log('\n📋 All environment variables containing "API":');
Object.keys(process.env)
  .filter(key => key.includes('API'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  });
