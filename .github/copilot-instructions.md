# GitHub Copilot Instructions for This Project

## Project Overview
- This is a Bun project.
- This project is dockerized.

## Database Configurations

### PostgreSQL
If PostgreSQL is used in this project:
- Docker Compose should use PostgreSQL v17 image
- Install and use the following packages:
  - `npm:kysely` for query building
  - `npm:pg` for PostgreSQL client

### Redis
If Redis is used in this project:
- Docker Compose should use Redis v8 image
- Install and use the following packages:
  - `npm:bullmq` for queue management
  - `npm:ioredis` for Redis client

## Telegram Bot Implementation
If this project implements a Telegram bot:
- Use `npm:grammy` and its related plugins
- **Important**: Grammy sessions MUST NOT be used in this project.

## Code Quality Standards
- **Always avoid the use of the `any` type** - use proper TypeScript types instead