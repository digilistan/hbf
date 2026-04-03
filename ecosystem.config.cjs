module.exports = {
  apps: [
    {
      name: "hbf-api",
      script: "./artifacts/api-server/dist/index.mjs",
      instances: "max", // Or a specific number like 2 for a small VPS
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      env_file: ".env",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      merge_logs: true,
    },
    // Optional: If you choose to serve the frontend via PM2 instead of Nginx static serving
    // {
    //   name: "hbf-web",
    //   script: "npx",
    //   args: "serve -s artifacts/hbf-web/dist -p 5173",
    //   env: {
    //     NODE_ENV: "production"
    //   }
    // }
  ]
};
