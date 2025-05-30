// Environment variables management
interface Config {
  botToken: string;
  environment: "development" | "production";
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

// Default configuration for development
export const config: Config = {
  botToken: process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE", // Replace in production
  environment: (process.env.NODE_ENV as "development" | "production") || "development",
  database: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    user: process.env.POSTGRES_USER || "telerpg",
    password: process.env.POSTGRES_PASSWORD || "telerpg_password",
    database: process.env.POSTGRES_DB || "telerpg_db",
  },
};

// Validate required configuration
function validateConfig(): void {
  if (config.botToken === "YOUR_BOT_TOKEN_HERE" && config.environment === "production") {
    throw new Error("Missing BOT_TOKEN environment variable in production mode");
  }
}

// Validate on load
validateConfig();