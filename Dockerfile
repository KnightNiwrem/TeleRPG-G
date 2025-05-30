FROM oven/bun:1

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Environment variables
ENV NODE_ENV=production

# Start the application by running the TypeScript source directly
CMD ["bun", "src/index.ts"]