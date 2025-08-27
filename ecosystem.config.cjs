module.exports = {
  apps: [{
    name: 'ui-grace-dashboard-3',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    error_file: '/var/log/pm2/ui-grace-dashboard-3-error.log',
    out_file: '/var/log/pm2/ui-grace-dashboard-3-out.log',
    max_memory_restart: '500M',
    watch: false,
    restart_delay: 5000
  }]
};