# TeleRPG-G

A Telegram bot RPG game built with [grammy](https://grammy.dev/) and [Bun](https://bun.sh/).

## Features

- Telegram Bot interface using Grammy library
- TypeScript support
- ESLint for code quality
- Docker support for easy deployment
- Database migrations using Kysely

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Docker](https://www.docker.com/) (optional, for containerized development)
- Telegram Bot Token (obtain from [@BotFather](https://t.me/BotFather))

### Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Copy the environment example file and fill in your bot token:
   ```bash
   cp .env.example .env
   # Edit .env with your Telegram Bot Token
   ```
4. Run database migrations:
   ```bash
   bun migrate
   ```
5. Start the development server:
   ```bash
   bun start
   ```

### Available Scripts

- `bun start`: Start the bot in development mode
- `bun run lint`: Run ESLint to check code quality
- `bun run typecheck`: Run TypeScript type checking
- `bun migrate`: Run all pending migrations
- `bun migrate:up`: Run all pending migrations (same as `migrate`)
- `bun migrate:down`: Roll back the most recent migration
- `bun migrate:create <name>`: Create a new migration file

## Docker Deployment

Build and run the Docker container:

```bash
docker-compose up --build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.