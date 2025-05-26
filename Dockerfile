FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Run linting and type checking
RUN bun run lint
RUN bun run typecheck

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Environment variables
ENV NODE_ENV=production

# Start the application
CMD ["bun", "dist/index.js"]