// server.cjs
const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// --- Configuration ---
// The Express server will run on this port for API calls
const BACKEND_PORT = 3000; 
// The Vite frontend is configured to run on this port (based on your output)
const FRONTEND_PORT = 8080; 
const PYTHON_CMD = 'python3'; 
const ANALYSIS_SCRIPT = 'analysis.py'; 

// --- Function to Start Backend (API Server) ---
function startBackendServer() {
    const app = express();
    
    // Middleware Setup
    app.use(cors()); 
    app.use(bodyParser.json({ limit: '50mb' })); 

    // Helper: The function that calls your analysis.py (inner functionality)
    function runPythonAnalysis(command, ideaId, inputData) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, ANALYSIS_SCRIPT);
            const args = [scriptPath, command];
            if (ideaId) { args.push(ideaId); }
            
            const pythonProcess = spawn(PYTHON_CMD, args);

            let stdout = '';
            let stderr = '';

            try {
                pythonProcess.stdin.write(JSON.stringify(inputData));
                pythonProcess.stdin.end();
            } catch (e) {
                 return reject({ status: 500, message: 'Failed to write data to Python stdin.', details: e.message });
            }
            
            pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
            pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    return reject({ status: 500, message: 'Analysis failed.', details: stderr || stdout });
                }
                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (e) {
                    reject({ status: 500, message: 'Invalid JSON response from analysis script.', details: stdout });
                }
            });
            
            pythonProcess.on('error', (err) => {
                reject({ status: 500, message: 'Failed to execute Python command.', details: err.message });
            });
        });
    }

    // --- API Endpoints ---
    app.post('/api/run-idea/:id', async (req, res) => {
        const ideaId = req.params.id;
        try {
            const result = await runPythonAnalysis('run_idea', ideaId, req.body);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json({ error: error.message, details: error.details });
        }
    });

    app.post('/api/run-all', async (req, res) => {
        try {
            const result = await runPythonAnalysis('run_all', null, req.body);
            res.json(result);
        } catch (error) {
            res.status(error.status || 500).json({ error: error.message, details: error.details });
        }
    });

    // Root route redirects users from the API port (3000) to the frontend port (8080)
    app.get('/', (req, res) => {
        res.redirect(`http://localhost:${FRONTEND_PORT}/`);
    });


    // Start Express server
    app.listen(BACKEND_PORT, () => {
        // Server started successfully, but we defer the success message until after Vite starts.
    });
}


// --- Function to Start Frontend (Vite) ---
function startFrontendDevServer() {
    
    // Spawns 'npm run dev' to start Vite
    const viteProcess = spawn('npm', ['run', 'dev'], { 
        cwd: __dirname, 
        shell: true,    // Essential for Windows compatibility
        // IGNORE ALL I/O: This is the key change to suppress the verbose Vite output
        stdio: 'ignore' 
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        viteProcess.kill('SIGINT');
        process.exit();
    });
}


// --- Main Orchestration ---
function main() {
    // 1. Start the Node.js Express backend server
    startBackendServer();
    
    // 2. Start the Vite/React frontend development server (silently)
    startFrontendDevServer();
    
    // 3. Wait 2 seconds for Vite to stabilize, then print the final, clean status.
    setTimeout(() => {
        console.log(`\nServer running on http://localhost:${FRONTEND_PORT}/`);
        console.log(`\nAll services are connected and running.`);
        console.log('(Press Ctrl+C to stop both services)');
    }, 2000); 
}

main();