/**
 * PM2 Ecosystem Configuration for Foundry MCP Backend
 * 
 * Usage:
 *   npm install -g pm2          # Install PM2 globally (once)
 *   pm2 start ecosystem.config.cjs   # Start the backend
 *   pm2 stop foundry-mcp-backend     # Stop the backend
 *   pm2 restart foundry-mcp-backend  # Restart
 *   pm2 logs foundry-mcp-backend     # View logs
 *   pm2 status                       # Check status
 *   pm2 save                         # Save current process list
 *   pm2 startup                      # Enable auto-start on boot
 * 
 * The backend will:
 *   - Auto-restart if it crashes
 *   - Run independently of Claude Desktop
 *   - Accept connections from any MCP client
 *   - Keep Foundry VTT connected 24/7
 */

module.exports = {
    apps: [
        {
            name: 'foundry-mcp-backend',
            script: 'dist/backend.js',
            cwd: __dirname,

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
