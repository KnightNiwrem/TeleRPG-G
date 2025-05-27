// Environment variables management
interface Config {
  botToken: string;
  environment: "development" | "production";
}

// Default configuration for development
export const config: Config = {
  botToken: process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE", // Replace in production
  environment: (process.env.NODE_ENV as "development" | "production") || "development",
};

// Validate required configuration
function validateConfig(): void {
  if (config.botToken === "YOUR_BOT_TOKEN_HERE" && config.environment === "production") {
    throw new Error("Missing BOT_TOKEN environment variable in production mode");
  }
}

// Validate on load
validateConfig();