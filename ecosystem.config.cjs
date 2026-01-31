/**
 * PM2 Ecosystem Configuration for Foundry MCP Backend
 *
 * Located at project root for convenience.
 *
 * Usage:
 *   npm install -g pm2          # Install PM2 globally (once)
 *   npm run mcp:pm2:start       # Start the backend
 *   npm run mcp:pm2:stop        # Stop the backend
 *   npm run mcp:pm2:restart     # Restart
 *   npm run mcp:pm2:logs        # View logs
 *   npm run mcp:pm2:status      # Check status
 *
 * The backend will:
 *   - Auto-restart if it crashes
 *   - Run independently of Claude Desktop
 *   - Accept connections from any MCP client
 *   - Keep Foundry VTT connected 24/7
 */

const path = require('path');

module.exports = {
    apps: [
        {
            name: 'foundry-mcp-backend',
            script: 'dist/backend.js',
            cwd: path.join(__dirname, 'packages', 'mcp-server'),

            // Environment
            env: {
                NODE_ENV: 'production',
                LOG_LEVEL: 'info',
                FOUNDRY_HOST: 'localhost',
                FOUNDRY_PORT: '31415'
            },

            // Restart behavior
            autorestart: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s',
            restart_delay: 3000,

            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'logs/backend-error.log',
            out_file: 'logs/backend-out.log',
            merge_logs: true,

            // Performance
            node_args: '--max-old-space-size=512',

            // Graceful shutdown
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000
        }
    ]
};
