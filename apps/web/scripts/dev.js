#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        // Only set if not already set in process.env
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnv();

// Get port from environment variable or use default
const port = process.env.WEB_PORT || "6500";

// Start Next.js dev server
const args = ["dev", "--turbopack", "-p", port];
const next = spawn("next", args, {
  stdio: "inherit",
  shell: true,
  cwd: path.join(__dirname, ".."),
});

next.on("error", (err) => {
  console.error("Failed to start Next.js:", err);
  process.exit(1);
});

next.on("close", (code) => {
  process.exit(code);
});

// Handle process termination
process.on("SIGINT", () => {
  next.kill("SIGINT");
});

process.on("SIGTERM", () => {
  next.kill("SIGTERM");
});
