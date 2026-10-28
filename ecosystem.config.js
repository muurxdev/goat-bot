module.exports = {
  apps: [
    {
      name: 'goat-bot-xp',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      exp_backoff_restart_delay: 1000,
      env: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/err.log',
      out_file: 'logs/combined.log',
      time: true,
      kill_timeout: 5000
    }
  ]
}

