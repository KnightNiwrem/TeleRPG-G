# TeleRPG-G: RiftChronicles

A text-based, command-driven MMORPG built for Telegram with TypeScript, using grammyjs, PostgreSQL, and Redis.

## Features

- Classic Fantasy RPG with character classes (Warrior, Mage, Rogue, Cleric)
- Explore various areas with different monsters and NPCs
- Combat system with skills and abilities
- Inventory management with equipment and items
- Quest system with objectives and rewards
- Persistent data storage in PostgreSQL
- State management without grammyjs sessions
- Background tasks using BullMQ

## Prerequisites

- Node.js (v16+)
- PostgreSQL
- Redis
- Telegram Bot Token (from BotFather)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KnightNiwrem/TeleRPG-G.git
   cd TeleRPG-G
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   # Bot Configuration
   BOT_TOKEN=your_telegram_bot_token_here

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=telerpg

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # BullMQ Configuration
   QUEUE_NAME=telerpg_queue
   ```

## Database Setup

1. Create the PostgreSQL database:
   ```bash
   createdb telerpg
   ```

2. Run migrations to set up the database schema:
   ```bash
   npm run migrate
   ```

3. Seed the database with initial game data:
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Docker Setup

You can also run the application using Docker:

```bash
docker-compose up -d
```

This will start PostgreSQL, Redis, and the application in separate containers.

## Bot Commands

- `/start` - Create a character or view your character
- `/explore` - Explore areas in the game world
- `/combat` - Engage in combat with monsters
- `/skill` - View and use your skills
- `/inventory` - Manage your inventory
- `/quest` - View available quests and progress
- `/help` - Show help message

## Project Structure

- `src/index.ts` - Main application entry point
- `src/bot.ts` - grammyjs bot setup
- `src/core/` - Core game logic, enums, types
- `src/database/` - Database connection and schema
- `src/services/` - Game services
- `src/handlers/` - Command handlers for Telegram
- `src/utils/` - Helper functions
- `src/state/` - State management logic

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
