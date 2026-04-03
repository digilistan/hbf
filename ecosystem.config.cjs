const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      value = value.replace(/^(['"])(.*)\1$/, '$2'); // remove quotes
      envVars[match[1]] = value.trim();
    }
  }
}

module.exports = {
  apps: [
    {
      name: "hbf-api",
      script: "./artifacts/api-server/dist/index.mjs",
      instances: "max", 
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        ...envVars
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      merge_logs: true,
    }
  ]
};
