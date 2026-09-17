module.exports = {
  apps: [
    {
      name: "lankacare",
      script: "npm",
      args: process.env.APP_TYPE === "backend" ? "run start --workspace backend" : "run start --workspace frontend",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
