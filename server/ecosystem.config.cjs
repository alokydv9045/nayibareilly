module.exports = {
  apps: [
    {
      name: 'nayibareilly-api',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      }
    }
  ]
}
