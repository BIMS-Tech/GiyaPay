const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting GiyaPay Servers...\n');

// Start Backend API Server
const apiServer = spawn('node', ['api-server.js'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, 'backend')
});

apiServer.stdout.on('data', (data) => {
    console.log(`📡 Backend API Server: ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
    console.error(`❌ Backend API Server Error: ${data.toString().trim()}`);
});

// Start Frontend Server
const frontendServer = spawn('node', ['frontend-server.js'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, 'frontend')
});

frontendServer.stdout.on('data', (data) => {
    console.log(`🎨 Frontend Server: ${data.toString().trim()}`);
});

frontendServer.stderr.on('data', (data) => {
    console.error(`❌ Frontend Server Error: ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    apiServer.kill();
    frontendServer.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    apiServer.kill();
    frontendServer.kill();
    process.exit(0);
});

console.log('✅ Both servers are starting...');
console.log('📱 Frontend: http://localhost:3000');
console.log('🔗 Backend API: http://localhost:3001');
console.log('📊 API Health: http://localhost:3001/api/health');
console.log('\n📁 Directory Structure:');
console.log('   ├── frontend/ (Static files, HTML, CSS, JS)');
console.log('   └── backend/ (API server, database)');
console.log('\nPress Ctrl+C to stop both servers\n'); 