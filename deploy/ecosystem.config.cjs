// PM2 process definition. Started once with:
//   pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
// Reloaded on every deploy by deploy/deploy.sh.
module.exports = {
  apps: [
    {
      name: "atin",
      // Call Next's binary directly so PM2 supervises the server, not an npm wrapper process.
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100",
      cwd: "/var/www/atin/app",
      // Two workers suit Hostinger KVM 1 and KVM 2. Each opens its own MySQL pool (connectionLimit 10),
      // so keep this well under the server's max_connections.
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "600M",
      env: { NODE_ENV: "production", PORT: "3100" },
      error_file: "/var/log/atin/error.log",
      out_file: "/var/log/atin/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
